const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const TileSetSchema = require('./TileSetSchema');
const bcrypt = require('bcrypt-nodejs');

// * Players can be assigned a list of profile_ids which will be used to populate
//   their tileSets when the admin adds the player (or updates the player's profile_ids)

const Player = new Schema({
  first_name: String,
  last_name: String,
  email: { type: String, unique: true, lowercase: true },
  password: String,
  mobile: String,
  sport: { type: String, lowercase: true },
  signup_date: Date,
  admin: { // not sure if this is necessary
    type: Schema.Types.ObjectId,
    ref: 'Admin'
  },
  profiles: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  }],
  tileSets: [TileSetSchema],
  created_date: { type: Date, default: Date.now }
});

// Before saving a player to the database, encrypt their password
Player.pre('save', function(next) {
  const player = this;
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(player.password, salt, null, function(err, hash) {
      if (err) { return next(err); }
      player.password = hash;
      next();
    });
  });
});

// All players have a comparePassword method, which uses bcrypt to hash both the
// password provided and the actual password and checks for a match
Player.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
}

module.exports = mongoose.model("Player", Player);
