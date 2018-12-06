var express = require("express");
var app = express();
var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

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
        urls: urlDatabase
    };

    res.render('urls_index', templateVars);
});

app.get('/urls/new', (req, res) => {
    res.render('urls_new');
});

app.post('/urls', (req, res) => {
    let longURL = req.body.longURL;
    let shortURL = generateRandomString();
    if(longURL){
        urlDatabase[shortURL] = longURL;
    }
    res.redirect('/urls/' + shortURL);
    
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
        longURL: urlDatabase[req.params.id]
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