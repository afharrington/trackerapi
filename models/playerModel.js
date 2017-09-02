const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const Player = new Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  mobile: { type: String },
  sport: { type: String, lowercase: true },
  signupDate: { type: Date },
  adminId: { type: String }, // admin associated with account
  profileId: { type: String }, // profile assigned to them
  tileIds: [], // specific tiles associated with individual player
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
