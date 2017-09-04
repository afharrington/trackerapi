var mongoose = require("mongoose");
var Admin = require("../models/adminModel.js");
var Player = require("../models/playerModel.js");

const jwt = require('jwt-simple');
const config = require('../config/keys.js');

// Creates a token using the secret stored in the config file + a timestamp
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return newJwtCode = jwt.encode({sub: user._id, iat: timestamp}, config.secret);
  const decoded = jwt.decode(newJwtCode, config.secret);
}

// ADMIN AUTHORIZATION =======================================================>

// POST /admin/login
exports.admin_login = function(req, res, next) {
  // Admin is already authorized via passport, just send token and admin first name
  const token = tokenForUser(req.user);
  res.send({ token: token, name: req.user.first_name } );
}

// POST /admin/signup
exports.admin_signup = function(req, res, next) {
  const first_name = req.body.firstName;
  const last_name = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

  // Check if admin account already exists for this email, else create a new admin
  Admin.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }
    if (existingUser) {
      return res.status(422).send({ error: 'This email address is already in use'});
    }

    const admin = new Admin({
      first_name,
      last_name,
      email,
      password
    });

    admin.save(function(err){
      if (err) { return next(err); }
      res.json({ token: tokenForUser(admin), name: admin.first_name });
    });
  });
}

// PLAYER AUTHORIZATION ======================================================>

// POST /login
exports.login = function(req, res, next) {
  // Player is already authorized via passport, just send token and player first name
  const token = tokenForUser(req.user);
  res.send({ token: token, name: req.user.first_name } );
}
