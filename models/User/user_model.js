const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userRegimenSchema = require('./user_regimen_schema');
const bcrypt = require('bcrypt-nodejs');

const userSchema = new Schema({
  firstName: { type: String, lowercase: true },
  lastName: { type: String, lowercase: true },
  email: {
    type: String,
    lowercase: true,
    required: [true, 'Email is required']},
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
    ref: 'regimen'
  }],
  // Actual regimens with user tiles
  userRegimens: [userRegimenSchema],
  created_date: { type: Date, default: Date.now }
});


userSchema.pre('save', function(next) {
  const user = this;
  const regimens = this.regimens;
  const Regimen = mongoose.model('regimen');

  bcrypt.genSalt(10, function(err, salt) {
    if (err) { return next(err); }
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) { return next(err); }
      user.password = hash;
      next();
    });
  });

  // For each regimen assigned, generate a userRegimen with
  // all tiles
  regimens.forEach(regimen => {
    const newUserRegimen = {
      userRegimenName: regimen.regimenName,
      userTiles: regimen.tiles
    }

    user.userRegimens.push(newUserRegimen);
    next();
  });
});


userSchema.pre('remove', function(next) {
  const userToRemove = this;
  const userAdmin = this.admin._id;
  const Admin = mongoose.model('admin');
  Admin.findById({ _id: userAdmin })
    .then((admin) => {
      admin.users = admin.users.filter(user => user == userToRemove );
      admin.save()
      .then(() => next());
    })
  });

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
}

module.exports = mongoose.model('user', userSchema);
