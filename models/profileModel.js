const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TileProfileSchema = require('./TileProfileSchema');

// * Profiles are created by, and linked to, individual admin accounts
// * A profile acts as a "blueprint" and contains a set of tiles with pre-defined settings
// * Profiles are assigned to individual players linked to that admin's account

const ProfileModel = new Schema({
  profile_name: { type: String, lowercase: true },
  tile_profiles: [TileProfileSchema],
  created_date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Profile', ProfileModel);
