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
  login (req, res, next) {
    const token = tokenForUser(req.user);
    res.send({ token: token, firstName: req.user.firstName } );
  },

  // POST /admin
  create_admin: async (req, res, next) => {
    const adminProps = req.body;
    try {
      let existingAdmin = await Admin.findOne({ email: adminProps.email });
      if (!existingAdmin) {
        let newAdmin = await Admin.create(adminProps);
        const token = tokenForUser(newAdmin);
        res.status(200).send({ token: token, firstName: newAdmin.firstName });
      } else {
        res.status(409).send('This email is already registered for an admin account');
      }
    } catch (err) {
      next(err);
    }
  },


  // GET /admin
  get_admin: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let admin = await Admin.findById({ _id: decoded.sub }).populate('regimens');
      res.status(200).send(admin);
    } catch(err) {
      next(err);
    }
  },


  // PUT /admin
  update_admin: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;

    try {
      let updatedAdmin = await Admin.findByIdAndUpdate(decoded.sub, props, {new: true});
      res.status(200).send(updatedAdmin);
    } catch(err) {
      next(err);
    }
  }

}


// // USER AUTHORIZATION ======================================================>
//
//   // POST /login
//   login_user (req, res, next) {
//     // User is already authorized via passport
//     const token = tokenForUser(req.user);
//     res.send({ token: token, email: req.user.email } );
//   }
// }
