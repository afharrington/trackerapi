const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const EntrySchema = require('./EntrySchema');

// * A Tile is an individual player's tile, which can be created automatically
//   through tileSets (i.e. when a profile_id is assigned to a player) or can
//   be manually created by the admin
// * An individual Tile's settings can be modified by the admin
// * Each tile contains an array of Entries added by the Player

const TileSchema = new Schema({
  player_id: String,
  tile_name: String,
  tile_profile_id: String,
  mode: String,
  goal_cycle: String,
  goal_hours: Number,
  continuous_days: Number,
  continuous_hours: Number,
  total_minutes: { type: Number, default: 0 },
  // color: { type: Number, default: 0 },
  entries: [EntrySchema],
  goal_last_cycle_start: { type: Date, default: Date.now },
  created_date: { type: Date, default: Date.now },
});

// TileSchema.virtual('color').get(function() {
//   return COLOR CALCULATION HERE
// });

module.exports = TileSchema;
