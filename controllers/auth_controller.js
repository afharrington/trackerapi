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

module.exports = {

// ADMIN AUTHORIZATION =======================================================>

  // POST /admin/login
  admin_login(req, res, next) {
    // Admin is already authorized via passport
    const token = tokenForUser(req.user);
    res.send({ token: token, email: req.user.email } );
  },


  // POST /admin/new
  admin_create(req, res, next) {
    const adminProps = req.body;

    Admin.findOne({ email: adminProps.email })
      .then((admin) => {
        if (admin === null) {
          Admin.create(adminProps)
            .then(admin => res.send(admin))
            .catch(next);
        } else {
          res.status(409).send('This email is already registered');
          console.log('send email exists error');
        }
      })
      .catch(next);
  },

// USER AUTHORIZATION ======================================================>

  // POST /login
  user_login(req, res, next) {
    // User is already authorized via passport
    const token = tokenForUser(req.user);
    res.send({ token: token, email: req.user.email } );
  }
}
