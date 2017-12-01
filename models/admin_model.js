const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');

const adminSchema = new Schema({
  firstName: { type: String, lowercase: true, required: [true, 'First name required'] },
  lastName: { type: String, lowercase: true },
  code: { type: String },
  email: {
    required: [true, 'Email required'],
    type: String,
    lowercase: true },
  password: { type: String},
  created_date: { type: Date, default: Date.now }
});

// Encrypts admin password before saving to database
adminSchema.pre('save', function(next) {
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

// bcrypt hashes both the password provided and the actual password and checks for a match
adminSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('admin', adminSchema);
