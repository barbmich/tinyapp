// declaration of packages required to run the program
// enstablishing constant variables that need to be defined first
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

// allows the use of Express js framework and body-parser, a body parsing middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// stores all links generated
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

/* old database object:
urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
}*/

//
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "ppp"
  }
}

// generates 6-digits random value in base 36 (alpha-numerical values)
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
};

function accountValidity(email, password) {
  if (!email || !password) {
    console.log('failed: missing data in the form!')
    return false;
  }
  for (const user in users) {
    if (users[user].email === email) {
      return false;
    }
  }
  return true
};

// process the request form for a shortURL:
app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();   // it assign randomized 6-digit value to shortURL, 
  let longURL = req.body.longURL;
  let userID = req.cookies.user_id
  urlDatabase[shortURL] = {};              // key longURL attached to the parsed body of the request form.
  urlDatabase[shortURL].longURL = longURL; // it adds the shortURL-longURL key-value to our initial urlDatabase object.
  urlDatabase[shortURL].userID = userID;
  res.redirect(302, "/urls");              // redirects the user to a webpage that outputs the newly created key-value
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(302, "/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  for (const user in users) {
    if (users[user].email === email) {
      if (users[user].password === password) {
        res.cookie("user_id", users[user].id);
        res.redirect("/urls");
        return;
      }
      else {
        res.sendStatus(403);
        return;
      }
    }
  }
  res.sendStatus(403);

});

// post request to delete a key of the object
app.post("/urls/:shortURL/delete", (req, res) => {  //
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect(302, "/urls");
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(302, "/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (accountValidity(email, password)) {
    let userID = generateRandomString();
    users[userID] = {}
    users[userID].id = userID;
    users[userID].email = email;
    users[userID].password = password;
    // console.log('new user registered!')
    res.cookie("user_id", userID);
    res.redirect(302, "/urls");
  } else {
    res.redirect(400, "/urls");
  }
})

app.get("/urls.json", (req, res) => {       // displays our urlDatabase object in a JSON format
  res.json(urlDatabase);
})

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];  // templateVars is assigned to an object. res.render is middleware through the HTML
  let templateVars = {                      // in urls_index. checking it, we'll see a for in loop is ran to output
    urls: urlDatabase,                      // each key-value property in a 2-columns table.
    user: user
  };
  res.render("urls_index", templateVars);
})

app.get("/urls/new", (req, res) => {
  let templateVars = {                      // provides a form where a longURL can be entered. when the request is sent (through
    user: users[req.cookies.user_id],      // the submit button), line 23 will pick up that post request
  }
  if (!templateVars.user) {
    res.redirect("/login")
  } else {
    res.render("urls_new", templateVars)
  };
})

app.get("/register", (req, res) => {
  res.render("urls_register")
})

app.get("/urls/:shortURL", (req, res) => {  // when accessing url /urls/[key], this will display specific longURL and shortURL info about that key
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  let templateVars = { shortURL, longURL, user: users[req.cookies.user_id] };
  res.render("urls_show", templateVars);
})

app.get("/u/:shortURL", (req, res) => {           // get request that allows us to reach the longURL address through the shortURL link.
  const shortURL = req.params.shortURL;           // the req.params refers to the id in the address. when a get request is made,
  const longURL = urlDatabase[shortURL].longURL;  // the server redirects to the longURL address value.
  res.redirect(302, longURL);
})

app.get("/login", (req, res) => {
  const templateVars = { error: "" };
  res.render("urls_login", templateVars);
})


app.listen(PORT, () => {                                  // allows the server to listen for requests made on a specific port (defined at the top) 
  console.log(`Example app listening on port ${PORT}!`);
});