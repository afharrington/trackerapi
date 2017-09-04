const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// A profile is a collection of tile profile ids
const TileProfile = new Schema({
  tile_name: { type: String },
  mode: { type: String, required: true, default: "continuous" },
  continuous_hours: { type: Number, default: 1 },
  continuous_days: { type: Number, default: 2 },
  goal_hours: { type: Number, default: null },
  goal_cycle: { type: String, default: null },
  created_date: { type: Date, default: Date.now },
});

const Profile = new Schema({
  profile_name: { type: String, lowercase: true },
  admin_id: { type: String },
  tile_profiles: [TileProfile],
  created_date: { type: Date, default: Date.now },
});



module.exports = mongoose.model("Profile", Profile);
