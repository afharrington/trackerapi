const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');

const Admin = require('../models/AdminModel');
const Player = require('../models/PlayerModel');
const config = require('../config/keys.js');

const localOptions = { usernameField: 'email' };

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeader(),
  secretOrKey: config.secret
};

// PLAYER PASSPORT STRATEGIES ===============================================>>

// Player login - checks if this player exists and if the password matches the database
passport.use('playerLocal', new LocalStrategy(localOptions, function(email, password, done) {
  Player.findOne({email: email}, function(err, player){
    if (err) { return done(err); }
    // If player does not exist, returns false
    if (!player) { return done(null, false); }

    player.comparePassword(password, function(err, isMatch){
      if (err) { return done(err);  }
      if (!isMatch) { return done(null, false); }
      return done(null, player);
    })
  })
}));

// Player authentication - checks if id encoded in the token matches a player
passport.use('playerJwt', new JwtStrategy(jwtOptions, function(payload, done) {
  Player.findById(payload.sub, function(err, player) {
    if (err) {
      return done(err, false); }
    if (player) {
      done(null, player);
    // No error, but player does not exist:
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
