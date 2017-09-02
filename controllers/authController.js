var mongoose = require("mongoose");
var Admin = require("../models/adminModel.js");
var Player = require("../models/playerModel.js");

const jwt = require('jwt-simple');
const config = require('../config/keys.js');

// Creates a token use the secret stored in the config file + a timestamp
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return newJwtCode = jwt.encode({sub: user._id, iat: timestamp}, config.secret);
  const decoded = jwt.decode(newJwtCode, config.secret);
}


// Admin token for testing: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1OWFiMzM2ZDJmOWZhZDAyOGQ2MTU2MDQiLCJpYXQiOjE1MDQzOTIwNDYwMDB9.e19Xj2jDdYocndVD_oMjimTaXfKcA9HorKVa2lMPWMY
// email2
// password2

// ADMIN AUTHORIZATION =======================================================>
// POST /admin/login
exports.admin_login = function(req, res, next) {
  // Admin is already authorized via passport, just send token
  const token = tokenForUser(req.user);
  res.send({ token: token, name: req.user.lastName } );
}

// POST /admin/signup
exports.admin_signup = function(req, res, next) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(422).send({ error: 'Please provide an email address and password'});
  }

  // Check if admin account already exists for this email, else create a new admin
  Admin.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }
    if (existingUser) {
      return res.status(422).send({ error: 'This email address is already in use'});
    }

    const admin = new Admin({
      firstName,
      lastName,
      email,
      password
    });

    admin.save(function(err){
      if (err) { return next(err); }
      res.json({ token: tokenForUser(admin), name: admin.lastName });
    });
  });
}

// PLAYER AUTHORIZATION =======================================================>
// POST /login
exports.login = function(req, res, next) {
  // Player is already authorized via passport, just send token
  const token = tokenForUser(req.user);
  res.send({ token: token, name: req.user.lastName } );
}
