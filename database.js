
// initial users database. I'm aware that their passwords are not hashed,
// they are there to help with test cases
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
};

// initial short urls database. As above, this is to help testing without
// having to always create entries when launching the server.
const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

module.exports = { users, urlDatabase };