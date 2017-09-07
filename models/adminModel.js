const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const AdminSchema = new Schema({
  first_name: { type: String, required: [true, 'First name is required'] },
  last_name: String,
  email: { type: String, lowercase: true },
  password: { type: String },

  // Each admin has a an array of players and a reference to Player collection
  players: [{
    type: Schema.Types.ObjectId,
    ref: 'Player'
  }],
  // Each admin has a an array of profiles and a reference to Profile collection
  profiles: [{
    type: Schema.Types.ObjectId,
    ref: 'Profile'
  }],

  created_date: { type: Date, default: Date.now }
});

// Before saving an admin to the database, encrypt their password
AdminSchema.pre('save', function(next) {
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
AdminSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('Admin', AdminSchema);
