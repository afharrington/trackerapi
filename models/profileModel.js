var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// A profile is a collection of tile profile ids
var Profile = new Schema({
  profileName: { type: String },
  tileProfileIds: [],
  created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Profile", Profile);
