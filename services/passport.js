const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const config = require('../config/keys.js');
const Admin = require('../models/admin_model');
const User = require('../models/user_model');

const localOptions = { usernameField: 'email' };

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: config.secret
};

// USER PASSPORT STRATEGIES ===============================================>>

// User login - checks if this user exists and if the password matches the database
passport.use('userLocal', new LocalStrategy(localOptions, function(email, password, done) {
  User.findOne({email: email}, function(err, user){
    if (err) { return done(err); }
    // If user does not exist, returns false
    if (!user) { return done(null, false); }

    user.comparePassword(password, function(err, isMatch){
      if (err) { return done(err);  }
      if (!isMatch) { return done(null, false); }
      return done(null, user);
    })
  })
}));

// User authentication - checks if id encoded in the token matches a user
passport.use('userJwt', new JwtStrategy(jwtOptions, function(payload, done) {
  User.findById(payload.sub, function(err, user) {
    if (err) {
      return done(err, false); }
    if (user) {
      done(null, user);
    // No error, but user does not exist:
    } else {
      done(null, false);
    }
  });
}));

// ADMIN PASSPORT STRATEGIES ================================================>>

// Admin login - checks if this admin exists and if the password matches the database
passport.use('adminLocal', new LocalStrategy(localOptions, function(email, password, done) {
  Admin.findOne({email: email}, function(err, admin){
    if (err) { return done(err); }
    // If admin does not exist, returns false
    if (!admin) { return done(null, false); }

    admin.comparePassword(password, function(err, isMatch){
      if (err) { return done(err);  }
      if (!isMatch) { return done(null, false); }
      return done(null, admin);
    })
  })
}));

// Admin authentication - checks if id encoded in the token matches an admin
passport.use('adminJwt', new JwtStrategy(jwtOptions, function(payload, done) {
  Admin.findById(payload.sub, function(err, admin) {
    if (err) {
      return done(err, false); }
    if (admin) {
      done(null, admin);
    // No error, but admin does not exist:
    } else {
      done(null, false);
    }
  });
}));
