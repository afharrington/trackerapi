const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userRegimenSchema = require('./user_regimen_schema');
const bcrypt = require('bcrypt-nodejs');


const userSchema = new Schema({
  firstName: String,
  lastName: String,
  email: { type: String, lowercase: true },
  password: String,
  mobile: String,
  sport: { type: String, lowercase: true },
  signupDate: Date,
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'admin'
  },
  // Regimen (templates) assigned to user
  regimens: [{
    type: Schema.Types.ObjectId,
    ref: 'regimen_template'
  }],
  // Actual regimens with user tiles
  userRegimens: [userRegimenSchema],
  created_date: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  const user = this;
  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });
});

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('user', userSchema);
