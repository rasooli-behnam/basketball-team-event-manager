const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    index: true
  },
  allowed_operation: [String]
});

module.exports = mongoose.model("Member", schema);
