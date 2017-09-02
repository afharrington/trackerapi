var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// A tile profile is a tile with settings
var TileProfile = new Schema({
  tileName: { type: String },
  mode: { type: String, required: true, default: "continuous" },
  continuousHours: { type: Number, default: 1 },
  continuousDays: { type: Number, default: 2 },
  goalHours: { type: Number, default: null },
  goalCycle: { type: String, default: null },
  created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TileProfile", TileProfile);
