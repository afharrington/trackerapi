var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// A tile profile is a tile with settings
var TileProfile = new Schema({
  tile_name: { type: String },
  mode: { type: String, required: true, default: "continuous" },
  continuous_hours: { type: Number, default: 1 },
  continuous_days: { type: Number, default: 2 },
  goal_hours: { type: Number, default: null },
  goal_cycle: { type: String, default: null },
  created_date: { type: Date, default: Date.now },
});

module.exports = mongoose.model("TileProfile", TileProfile);
