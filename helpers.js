const { users, urlDatabase } = require("./database");
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
};

const getUserByEmail = (email, database) => {
  for (let user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return false;
};

const authenticateUser = (email, password) => {
  const user = getUserByEmail(email, users);
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

module.exports = { addNewUser, generateRandomString, getUserByEmail, authenticateUser, urlsForUser }