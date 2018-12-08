var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

var cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');

app.use(cookieParser());
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
};

const users = { 
    "userRandomID": {
      id: "userRandomID", 
      email: "user@example.com", 
      password: "purple-monkey-dinosaur"
    },
   "user2RandomID": {
      id: "user2RandomID", 
      email: "user2@example.com", 
      password: "dishwasher-funk"
    }
};

function generateRandomString(){
    return Math.random().toString(36).substring(2, 8);
}

function findUserByEmail(email){
    for(let index in users){
        if(email === users[index].email){
            return users[index];
        }
    }
    return false;
}

app.get('/urls', (req, res) => {

    let templateVars = {
        urls: urlDatabase,
        user: users[req.cookies["user_id"]]
    };

    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    let templateVars = {
        user: users[req.cookies['user_id']]
    }
    if(templateVars.user){
        res.render('urls_new', templateVars);
    } else {
        res.redirect('/login');
    }
    
});

//GET request to /register
//just show the /register page....
app.get('/register', (req, res) => {
    res.render('register');
});

//post request to our /register page
app.post('/register', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    // let userExists = findUserByEmail(email);
    if(email === "" || password === "") {
        res.sendStatus(400);
    } else if(findUserByEmail(email)) {
        res.sendStatus(400);
    } else {
        let id = generateRandomString();
        let newUser = {
            id,
            email,
            password
        };
        users[id] = newUser;
        res.cookie('user_id', id);
        res.redirect('/urls');
    }
    console.log(users);
    
});

//Post route for adding a newURL to our database..
app.post('/urls', (req, res) => {
    //setting the contents of form field to longURL
    let longURL = req.body.longURL;
    //function returns generated short string/shortURL
    let shortURL = generateRandomString();

    //if(formfield)== add a new URL
    if(longURL){
        urlDatabase[shortURL] = longURL;
    }
    //redirection....
    res.redirect('/urls/' + shortURL);
    
});

app.get('/login', (req, res) => {
    res.render('login');
});

//post route to "/login"
app.post('/login', (req, res) => {

    //display the contents of the form field
    let email = req.body.email;
    let password = req.body.password;
    let goodUser = findUserByEmail(email);
    if(email === "" || password === ""){
        res.status(403).send("I need both, email and a password.  <3");
    } else if (!goodUser) {
        // no such user you dumb shit
        res.status(403).send("You aren't registered.");
    } else if (password !== goodUser.password) {
        // no such password, wtf
        res.status(403).send("I need the right password..")
    } else {
        // holy shit, I cannot believe it, you are the real deal
        res.cookie('user_id', goodUser.id);
        res.redirect('/');
    }


    //set a cookie by the name of 'user_id' using express..
    
    
    //redirecting to '/urls' link..
    res.redirect('/urls');
});

//post route to /logout
app.post('/logout', (req, res) => {
    res.clearCookie("user_id"); //clear the damn cookie

    //redirection after that
    res.redirect('/urls');
});

app.post('/urls/:shortURL/update', (req, res) => {
    let shortURL = req.params.shortURL;
    console.log(shortURL);
    urlDatabase[shortURL] = req.body.longURL;
    res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
    // console.log(req.params.id);
    // let shortURL = req.params.id;
    // let longURL = urlDatabase[req.params.id];
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});

//redirection to longURL whenever access to /u/:shortURL is requested 
app.get("/u/:shortURL", (req, res) => {
    // console.log(req.params.shortURL);
    let longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  });


app.get('/urls/:id', (req, res) => {
    let templateVars = {
        shortURL: req.params.id,
        longURL: urlDatabase[req.params.id],
        user: users[req.cookies['user_id']]
    };
    res.render('urls_show', templateVars);
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});