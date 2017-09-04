const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const Player = new Schema({
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  mobile: { type: String },
  sport: { type: String, lowercase: true },
  signup_date: { type: Date },
  admin_id: { type: String }, // admin associated with account
  profile_id: { type: String }, // profile assigned to them
  tile_ids: [], // specific tiles associated with individual player
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

module.exports = mongoose.model('Player', Player);
