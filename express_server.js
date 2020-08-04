// declaration of packages required to run the program
// enstablishing constant variables that need to be defined first
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = 8080; // default port 8080

// allows the use of Express js framework and body-parser, a body parsing middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

// generates 6-digits random value in base 36 (alpha-numerical values)
function generateRandomString() {
  return Math.random().toString(36).substring(2,8)
};

// process the request form for a shortURL:
app.post("/urls", (req, res) => { 
  let shortURL = generateRandomString();   // it assign randomized 6-digit value to shortURL, 
  let longURL = req.body.longURL;          // key longURL attached to the parsed body of the request form.
  urlDatabase[shortURL] = longURL;         // it adds the shortURL-longURL key-value to our initial urlDatabase object.
  res.redirect(302, "/urls");              // redirects the user to a webpage that outputs the newly created key-value
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(302, "/urls");
});

// app.get("/urls/:shortURL?", (req, res) => {
//   let shortURL = req.params.shortURL;
//   res.redirect(302, `/urls/:${shortURL}`)
// })

// post request to delete a key of the object
app.post("/urls/:shortURL/delete", (req, res) => {  //
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls")
})

// app.get("/", (req, res) => {            // homepage is useless for now        
//   res.send("Hello!");
// });

app.get("/urls.json", (req, res) => {       // displays our urlDatabase object in a JSON format
  res.json(urlDatabase);
})

app.get("/urls", (req, res) => {            // templateVars is assigned to an object. res.render is middleware through the HTML
  let templateVars = { urls: urlDatabase }; // in urls_index. checking it, we'll see a for in loop is ran to output
  res.render("urls_index", templateVars);   // each key-value property in a 2-columns table.
})

app.get("/urls/new", (req, res) => {        // provides a form where a longURL can be entered. when the request is sent (through
  res.render("urls_new");                   // the submit button), line 23 will pick up that post request
})

app.get("/urls/:shortURL", (req, res) => {  // when accessing url /urls/[key], this will display specific longURL and shortURL info about that key
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  let templateVars = { shortURL, longURL };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {     // get request that allows us to reach the longURL address through the shortURL link.
  const shortURL = req.params.shortURL;     // the req.params refers to the id in the address. when a get request is made,
  const longURL = urlDatabase[shortURL];    // the server checks if a key matching shortURL exists. if so, the user is redirected
  res.redirect(302, longURL);               // to the longURL address.
})


// app.get("/hello", (req, res) => {        // useless for now.
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.listen(PORT, () => {                                  // allows the server to listen for requests made on a specific port (defined at the top) 
  console.log(`Example app listening on port ${PORT}!`);
});