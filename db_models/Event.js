const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  venue: {
    type: String,
    required: true,
    index: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member"
  },
  payer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    index: true
  },
  bill_amount: Number
});

module.exports = mongoose.model("Event", schema);
