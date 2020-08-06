// declaration of packages required to run the program
// enstablishing constant variables that need to be defined first
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session")
const bcrypt = require('bcrypt');
const saltRounds = 10;
const app = express();
const PORT = 8080; // default port 8080

// allows the use of Express js framework and body-parser, a body parsing middleware
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['test1', 'test2'],
  })
);

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
    password: "ooo"
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

const addNewUser = (email, password) => {
  const userID = generateRandomString();
  users[userID] = {};
  users[userID].id = userID;
  users[userID].email = email;
  users[userID].password = bcrypt.hashSync(password, saltRounds);
  return users[userID];
}

// if user exists in db, returns user obj, else returns false
const findUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return false;
};

const authenticateUser = (email, password) => {
  const user = findUserByEmail(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

const urlsForUser = function (user) {
  const output = {};
  if (user === undefined) {
    return undefined
  } else {
    for (const url in urlDatabase) {
      if (urlDatabase[url].userID === user.id) {
        output[url] = urlDatabase[url]
      }
    }
  }
  return output;
}

// process the request form for a shortURL:
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();   // it assign randomized 6-digit value to shortURL, 
  const longURL = req.body.longURL;
  const userID = req.cookies.user_id;
  urlDatabase[shortURL] = {};              // key longURL attached to the parsed body of the request form.
  urlDatabase[shortURL].longURL = longURL; // it adds the shortURL-longURL key-value to our initial urlDatabase object.
  urlDatabase[shortURL].userID = userID;
  res.redirect(302, `/urls/${shortURL}`);              // redirects the user to a webpage that outputs the newly created key-value
});

app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  if (req.cookies.user_id === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = longURL;
    res.redirect(302, "/urls");
  } else {
    res.send("You can't edit an URL that you did not create!")
  }
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let user = authenticateUser(email, password);
  if (user) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.redirect(400, "/login");
  }
});

// post request to delete a key of the object
app.post("/urls/:shortURL/delete", (req, res) => {
  let shortURL = req.params.shortURL;
  
  if (req.cookies.user_id === undefined) {
    res.send("Login to delete this URL!");
  } else if (req.cookies.user_id === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
    res.redirect(302, "/urls");
  } else {
    res.send("This link does not belong to you, no touchy!");
  }
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect(302, "/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  let user = findUserByEmail(email);

  if (!user) {
    const newUserID = addNewUser(email, password)
    // console.log('new user registered!')
    res.cookie("user_id", newUserID.id);
    res.redirect(302, "/urls");
  } else {
    res.redirect(400, "/login"); // <----------------- see if you can also send a friendly message!
  }
});

app.get("/", (req, res) => {
  let user = users[req.cookies.user_id];
  if (user) {
    res.redirect(302, "/urls");
  }
  else {
    res.redirect(302, "/login");
  }
})

app.get("/urls.json", (req, res) => {       // displays our urlDatabase object in a JSON format
  res.json(urlDatabase);
})

app.get("/users.json", (req, res) => {
  res.json(users);
})

app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id];  // templateVars is assigned to an object. res.render is middleware through the HTML
  let templateVars = {                      // in urls_index. checking it, we'll see a for in loop is ran to output
    urls: urlsForUser(user),                // each key-value property in a 2-columns table.
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
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : res.status(404).send("This shortURL does not exist!");
  // const longURL = urlDatabase[shortURL].longURL;
  const user = users[req.cookies.user_id];
  if (user) {
    if (user.id === urlDatabase[shortURL].userID) {
      let templateVars = { shortURL, longURL, user: user };
      res.render("urls_show", templateVars);
    } else {
      res.send("You're trying to access an URL that does not belong to you!")
    }
  } else {
    res.send("Log in to access this URL!")
  }
})

app.get("/u/:shortURL", (req, res) => {           // get request that allows us to reach the longURL address through the shortURL link.
  const shortURL = req.params.shortURL;           // the req.params refers to the id in the address. when a get request is made,
  const longURL = urlDatabase[shortURL].longURL;  // the server redirects to the longURL address value.
  res.redirect(302, longURL);
})

app.get("/login", (req, res) => {
  if (req.cookies.user_id) {
    res.redirect(302, "/urls")
  } else {
    const templateVars = { error: "" };
    res.render("urls_login", templateVars);
  }
})


app.listen(PORT, () => {                                  // allows the server to listen for requests made on a specific port (defined at the top) 
  console.log(`Example app listening on port ${PORT}!`);
});