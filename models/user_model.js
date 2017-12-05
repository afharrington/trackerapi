const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');
const async = require('async');

const userSchema = new Schema({
  firstName: { type: String, lowercase: true },
  lastName: { type: String, lowercase: true },
  code: String,
  mobile: String,
  email: {
    type: String,
    lowercase: true },
  password: { type: String },
  sport: { type: String, lowercase: true },
  adminId: String,
  activeUserProgram: {
    type: Schema.Types.ObjectId,
    ref: 'userProgram'
  },
  recentEntry: {
    type: Schema.Types.ObjectId,
    ref: 'entry'
  },
  created_date: { type: Date, default: Date.now }
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
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


// userSchema.pre('remove', function(next) {
//   const userToRemove = this;
//   const userAdmin = this.adminId;
//   const Admin = mongoose.model('admin');
//   Admin.findById({ _id: userAdmin })
//     .then((admin) => {
//       admin.users = admin.users.filter(user => user == userToRemove );
//       admin.save()
//       .then(() => next());
//     })
//   });

userSchema.methods.comparePassword = function(candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) { return callback(err); }
    callback(null, isMatch);
  });
}

// userSchema.virtual('activeProgramName').get(function() {
//   return this.programs[this.activeProgram].programName;
// });

module.exports = mongoose.model('user', userSchema);
