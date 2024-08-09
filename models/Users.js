const mongoose = require("mongoose");

const Users = mongoose.model(
  "Users",

  {
    email: String,
    account: {
      username: String,
      avatar: Object,
    },
    newsletter: Boolean,
    token: String,
    hash: String,
    salt: String,
  }
);

module.exports = Users;
