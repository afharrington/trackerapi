const mongoose = require('mongoose');
const Admin = require('../models/Admin/admin_model');
const User = require('../models/User/user_model');

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
  res.send({ token: token, name: req.user.firstName } );
}

// POST /admin/signup
exports.admin_signup = function(req, res, next) {
  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;

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
      res.send({ token: tokenForUser(admin), name: admin.firstName });
    });
  });
}

// PLAYER AUTHORIZATION ======================================================>

// POST /login
exports.login = function(req, res, next) {
  // Player is already authorized via passport, just send token and player first name
  const token = tokenForUser(req.user);
  res.send({ token: token, name: req.user.firstName } );
}
