const { users } = require("./database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

// creates a random 6-digits alphanumerical string to be used as ID.
const generateRandomString = function () {
  return Math.random().toString(36).substring(2, 8);
};

// takes email and password parameters from /urls/register route, creates a new user
// entry in the users database, hashes its password, and returns the object created.
const addNewUser = (email, password) => {
  let userID;
  do {
    userID = generateRandomString();
  } while (users[userID]);
  users[userID] = {};
  users[userID].id = userID;
  users[userID].email = email;
  users[userID].password = bcrypt.hashSync(password, saltRounds);
  return users[userID];
};

// uses an email parameter to check a database if a user with that
// email exists. if so, returns user object (else, returns false)
const getUserByEmail = (email, database) => {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

// used on post/login, this function takes the two arguments provided by the user
// by filling the login form, and returns either the user object (to create a cookie
// session with it - that allows the user to navigate the website) or returns false
const authenticateUser = (email, password) => {
  const user = getUserByEmail(email, users);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  } else {
    return false;
  }
};

// used on on the index route /urls, given a user and a database, returns an object
// with all entries created by the user
const userUrls = function (user, database) {
  const output = {};
  if (user === undefined) {
    return undefined;
  } else {
    for (const entry in database) {
      if (database[entry].userID === user.id) {
        output[entry] = database[entry];
      }
    }
  }
  return output;
};

module.exports = {
  addNewUser,
  generateRandomString,
  getUserByEmail,
  authenticateUser,
  userUrls,
};
