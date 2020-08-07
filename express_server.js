// declaration of packages required to run the program
// enstablishing constant variables that need to be defined first
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const { addNewUser, generateRandomString, getUserByEmail, authenticateUser, userUrls } = require("./helpers");
const { users, urlDatabase } = require("./database");
const app = express();
const PORT = 8080;

// sets the use of middlewares EJS, body-parser and cookie-session through Express.
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['test1', 'test2'],
}));


// process the request form to generate a shortURL:
// generates random userID, 
app.post("/urls", (req, res) => {
  let shortURL;
  do {
    shortURL = generateRandomString();
  } while (users[shortURL]);
  const longURL = req.body.longURL;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {};
  urlDatabase[shortURL].longURL = longURL;
  urlDatabase[shortURL].userID = userID;
  res.redirect(302, `/urls/${shortURL}`);
});

// edits a currently existing entry:
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  if (req.session.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(302, "/urls");
  } else {
    res.send("You can't edit an URL that you did not create!");
  }
});

// process a login form:
// uses authenticateUser to confirm credentials entered.
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let user = authenticateUser(email, password);
  if (user) {
    req.session.user_id = user.id;
    res.redirect("/urls");
  } else {
    res.status(400).send("Incorrect credentials entered!");
  }
});

// post request to delete a key of the object
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  
  if (req.session.user_id === undefined) {
    res.send("Login to delete this URL!");
  } else if (req.session.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect(302, "/urls");
  } else {
    res.send("This link does not belong to you, no touchy!");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, "/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Missing credentials!");
  }
  let user = getUserByEmail(email, users);

  if (!user) {
    const newUserID = addNewUser(email, password)
    req.session.user_id = newUserID.id;
    res.redirect(302, "/urls");
  } else {
    res.status(400).send("E-mail already in use!"); // <----------------- see if you can also send a friendly message!
  }
});

app.get("/", (req, res) => {
  let user = users[req.session.user_id];
  if (user) {
    res.redirect(302, "/urls");
  } else {
    res.redirect(302, "/login");
  }
});

app.get("/urls.json", (req, res) => {       // displays our urlDatabase object in a JSON format
  res.json(urlDatabase);
});

app.get("/users.json", (req, res) => {
  res.json(users);
});

app.get("/urls", (req, res) => {
  const user = users[req.session.user_id];  // templateVars is assigned to an object. res.render is middleware through the HTML
  let templateVars = {                      // in urls_index. checking it, we'll see a for in loop is ran to output
    urls: userUrls(user, urlDatabase),                // each key-value property in a 2-columns table.
    user: user
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {                      // provides a form where a longURL can be entered. when the request is sent (through
    user: users[req.session.user_id],      // the submit button), line 23 will pick up that post request
  };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect(302, "/urls");
  } else {
  res.render("urls_register");
  }
});

app.get("/urls/:shortURL", (req, res) => {  // when accessing url /urls/[key], this will display specific longURL and shortURL info about that key
  const shortURL = req.params.shortURL;  
  const longURL = urlDatabase[shortURL] && urlDatabase[shortURL].longURL;
  if(!longURL) {
  return res.status(404).send("This shortURL does not exist!");
  }
  // const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.session.user_id];
  if (user) {
    if (user.id === urlDatabase[shortURL].userID) {
      let templateVars = { shortURL, longURL, user: user };
      res.render("urls_show", templateVars);
    } else {
      res.send("You're trying to access an URL that does not belong to you!");
    }
  } else {
    res.send("Log in to access this URL!");
  }
});

app.get("/u/:shortURL", (req, res) => {           // get request that allows us to reach the longURL address through the shortURL link.
  const shortURL = req.params.shortURL;           // the req.params refers to the id in the address. when a get request is made,
  const longURL = urlDatabase[shortURL].longURL;  // the server redirects to the longURL address value.
  res.redirect(302, longURL);
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect(302, "/urls");
  } else {
    const templateVars = { error: "" };
    res.render("urls_login", templateVars);
  }
});


app.listen(PORT, () => {                                  // allows the server to listen for requests made on a specific port (defined at the top)
  console.log(`Example app listening on port ${PORT}!`);
});