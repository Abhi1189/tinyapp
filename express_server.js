var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

var cookieSession = require('cookie-session');
var cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');

app.use(cookieParser());

app.use(cookieSession({
    name: 'session',
    keys: ['key1', 'key2'],
    maxAge: 24 * 60 * 60 * 1000 //24 hour expiry..
}));

const bcrypt = require('bcrypt');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//hardcoded database.. acts as direction when adding new urls..
var urlDatabase = {
    "b2xVn2": {
        longURL: "http://www.lighthouselabs.ca",
        userID: "userRandomID"
    },
    
    "9sm5xK": {
        longURL: "http://www.google.com",
        userID: "user2RandomID"
    }


};

//our user database
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

//rendering the index page with the conditions.
app.get('/urls', (req, res) => {
    let cookie = req.session.user_id;
    //helped by Nick here. 
    if(!cookie){
        cookie = null;
    }
    let templateVars = {
            urls: urlDatabase,
            user: users[cookie],
            cookie: cookie
    };

    res.render('urls_index', templateVars);
});

//Post route for adding a newURL to our database..
app.post('/urls', (req, res) => {
    //setting the contents of form field to longURL
    let longURL = req.body.longURL;
    //function returns generated short string/shortURL
    let shortURL = generateRandomString();

    //if(formfield) => add a new URL
    if(longURL){
        
        urlDatabase[shortURL] = {
            longURL: longURL,
            userID: req.session.user_id
    };

    res.redirect('/urls/' + shortURL);
    }
});

//rendering the newURL page..
app.get('/urls/new', (req, res) => {
    let templateVars = {
        //read cookie as it's a userID
        user: users[req.session.user_id]
    }
    if(templateVars.user){ //if user is logged in 
        res.render('urls_new', templateVars);
    } else {
        res.redirect('/login');
    }
    
});

//rendering the registration page..
app.get('/register', (req, res) => {
    res.render('register');
});

//post request to our /register page
app.post('/register', (req, res) => {
    let email = req.body.email;
    let password = req.body.password;

    //Hashed password using bcrypt library.
    //second argument in the function represents the hashing rate.
    let hashPass = bcrypt.hashSync(password, 10);

    // let userExists = findUserByEmail(email);
    if(email === "" || password === "") {
        res.sendStatus(400);
    } else if(findUserByEmail(email)) {
        res.sendStatus(400);
    } else {
        //create new user
        let id = generateRandomString();
        //format of our new user.
        let newUser = {
            id,
            email,
            hashPass
        };
        //push new new user object into our users object database.
        users[id] = newUser;
        //set the session cookie
        req.session.user_id = id;
        res.redirect('/urls');
    }
});



app.get('/login', (req, res) => {
    res.render('login');
});

//post route to "/login"
app.post('/login', (req, res) => {

    //display the contents of the form field
    let email = req.body.email;
    let password = req.body.password;

    //validates if user exists =  goodUser
    let goodUser = findUserByEmail(email);
    
    if(email === "" || password === ""){ 
        res.status(403).send("I need both, email and a password.  <3");
    } else if (!goodUser) {
        // no such user you dumb shit
        res.status(403).send("You aren't registered.");
    } else if (!bcrypt.compareSync(password, goodUser.hashPass)) {
        // no such password, wtf
        res.status(403).send("I need the right password..")
    } else {
        // holy shit, I cannot believe it, you are the real deal
        req.session.user_id = goodUser.id;
        // res.cookie('user_id', goodUser.id);
        res.redirect('/');
    }
    
    //redirecting to '/urls' link..
    res.redirect('/urls');
});

//post route to /logout
app.post('/logout', (req, res) => {
    //clear the damn cookies 
    res.clearCookie("session");
    res.clearCookie("session.sig");

    //destroy the session
    res.session = null;

    //redirection after that
    res.redirect('/urls');
});

app.post('/urls/:shortURL/update', (req, res) => {
    let shortURL = req.params.shortURL;
    
    //update a shortURL..
    urlDatabase[shortURL].longURL = req.body.longURL;
    
    res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
    //delete and entry from our database when user clicks delete.
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});

//redirection to longURL whenever this request is made 
app.get("/u/:shortURL", (req, res) => {
    let shortURL = req.params.shortURL;
    let longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
});


app.get('/urls/:id', (req, res) => {
    //if cookie exists.. user logged in..
    if(req.session.user_id){
        let templateVars = {
            shortURL: req.params.id,
            longURL: urlDatabase[req.params.id].longURL,
            user: users[req.session.user_id]
        };
        res.render('urls_show', templateVars);
    } else {
        res.status(403).send("You are not logged in.");
    }
    
    
});


app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});