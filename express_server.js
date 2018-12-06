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

function generateRandomString(){
    return Math.random().toString(36).substring(2, 8);
}

app.get('/urls', (req, res) => {
    let templateVars = {
        urls: urlDatabase,
        username: req.cookies["username"]
    };

    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    let templateVars = {
        username: req.cookies['username']
    }
    res.render('urls_new', templateVars);
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

//post route to "/login"
app.post('/login', (req, res) => {

    //display the contents of the form field
    // console.log(req.body.username);
    
    //set a cookie by the name of 'username' using express..
    res.cookie('username', req.body.username);
    
    //redirecting to '/urls' link..
    res.redirect('/urls');
});

//post route to /logout
app.post('/logout', (req, res) => {
    res.clearCookie("username"); //clear the damn cookie

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
        username: req.cookies['username']
    };
    res.render('urls_show', templateVars);
});



app.get("/urls/new", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});