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
  admin_login (req, res, next) {
    const token = tokenForUser(req.user);
    res.send({ token: token, firstName: req.user.firstName, lastName: req.user.lastName } );
  },

  // POST /admin
  create_admin: async (req, res, next) => {
    const adminProps = req.body;
    try {
      let existingAdmin = await Admin.findOne({ email: adminProps.email });
      if (!existingAdmin) {
        let newAdmin = await Admin.create(adminProps);
        const token = tokenForUser(newAdmin);
        res.status(200).send({ token: token, firstName: newAdmin.firstName, lastName: newAdmin.lastName });
      } else {
        res.status(409).send('This email is already registered for an admin account');
      }
    } catch (err) {
      next(err);
    }
  },

  // PUT /admin/register
  register_admin: async (req, res, next) => {
    const adminProps = req.body;
    try {
      let existingAdmin = await Admin.findOne({ code: adminProps.code });
      if (existingAdmin) {
        if (Number(adminProps.code) !== Number(existingAdmin.code)) {
          res.status(409).send('Email and registration code do not match.');
        } else {
          existingAdmin.password = adminProps.password;
          existingAdmin.password = adminProps.firstName;
          existingAdmin.password = adminProps.lastName;
          let updatedAdmin = await existingAdmin.save();
          const token = tokenForUser(updatedAdmin);
          res.status(200).send({ token: token, firstName: updatedAdmin.firstName, lastName: updatedAdmin.lastName });
        }
      } else if (!existingAdmin) {
        res.status(300).send('3up member not found.');
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
  },


// USER AUTHORIZATION =======================================================>

  // POST /user/login
  user_login (req, res, next) {
    const token = tokenForUser(req.user);
    res.send({ token: token, firstName: req.user.firstName, lastName: req.user.lastName } );
  },

  // POST /user/forgot
  forgot_password (req, res, next) {
    const nodemailer = require('nodemailer');

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    nodemailer.createTestAccount((err, account) => {

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: account.user, // generated ethereal user
            pass: account.pass  // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"Anna" <anna@pineappleny.com>', // sender address
        to: 'annafkh@gmail.com', // list of receivers
        subject: 'Reset password', // Subject line
        text: 'Here you go!', // plain text body
        html: '<b>HTML here you go</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

    });
  });
    res.status(200).send();
  },

  // PUT /user/register
  register_user: async (req, res, next) => {
    const userProps = req.body;
    try {
      let existingUser = await User.findOne({ code: userProps.code });
      if (existingUser) {
        if (Number(userProps.code) !== Number(existingUser.code)) {
          res.status(409).send('Email and registration code do not match.');
        } else {
          existingUser.password = userProps.password;
          existingUser.code = '00000';

          let updatedUser = await existingUser.save();
          const token = tokenForUser(updatedUser);
          res.status(200).send({ token: token, firstName: updatedUser.firstName, lastName: updatedUser.lastName });
        }
      } else if (!existingUser) {
        res.status(300).send('3up member not found.');
      }
    } catch (err) {
      next(err);
    }
  },


}
