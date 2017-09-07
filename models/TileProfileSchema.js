const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// * Profiles contain an array of TileProfiles
// * TileProfiles contain tile settings that will be applied to a matching tile
//   in each individual player's account

const TileProfileSchema = new Schema({
  tile_name: { type: String },
  mode: { type: String, required: true, default: "continuous" },
  continuous_hours: { type: Number, default: 1 },
  continuous_days: { type: Number, default: 2 },
  goal_hours: { type: Number, default: null },
  goal_cycle: { type: String, default: null },
  created_date: { type: Date, default: Date.now },
});

module.exports = TileProfileSchema;
