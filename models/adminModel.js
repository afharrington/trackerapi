const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const Admin = new Schema({
  player_ids: [],
  profiles: [],
  tile_profiles: [],
  first_name: { type: String },
  last_name: { type: String },
  email: { type: String, unique: true, lowercase: true },
  password: { type: String },
  created_date: { type: Date, default: Date.now }
});

// Before saving an admin to the database, encrypt their password
Admin.pre('save', function(next) {
  const admin = this;
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(admin.password, salt, null, function(err, hash) {
      if (err) { return next(err); }
      admin.password = hash;
      next();
    });
  });
});

// All admins have a comparePassword method, which uses bcrypt to hash both the
// password provided and the actual password and checks for a match
Admin.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('Admin', Admin);
