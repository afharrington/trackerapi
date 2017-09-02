var mongoose = require("mongoose");

var Admin = require("../models/adminModel.js");
var Player = require("../models/playerModel.js");

var profileModel = require("../models/profileModel.js");
var tileProfileModel = require("../models/tileProfileModel.js");

// To extract and decrypt authorization headers for all requests, then use id to query database
const jwt = require('jwt-simple');
const config = require('../config/keys.js');
const ExtractJwt = require('passport-jwt').ExtractJwt;

// GET /admin
exports.get_admin_dashboard = function(req, res) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Admin.findById({ _id: decoded.sub }, function(err, admin) {
    if (err) res.send(err)
    const adminDetails = {
      "firstName": admin.firstName,
      "lastName": admin.lastName,
      "email": admin.email,
      "profileIds": admin.profileIds,
      "playerIds": admin.playerIds
    }
    res.json(adminDetails);
  });
};

// POST admin/player
exports.add_player = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  const firstName = req.body.firstName;
  const lastName = req.body.lastName;
  const email = req.body.email;
  const password = req.body.password;
  const mobile = req.body.mobile;
  const sport = req.body.sport;
  const profileId = req.body.profileId;
  const adminId = decoded.sub;

  if (!email || !password) {
    return res.status(422).send({ error: 'Please provide an email address and password'});
  }

  Player.findOne({ email: email }, function(err, existingUser) {
    if (err) { return next(err); }
    if (existingUser) {
      return res.status(422).send({ error: 'A player with this email address already exists'});
    }

    const player = new Player({
      firstName,
      lastName,
      email,
      password,
      mobile,
      sport,
      profileId,
      adminId
    });

    player.save(function(err){
      if (err) { return next(err); }
      res.json(player);
    });

    Admin.findById({ _id: decoded.sub }, function(err, admin) {
      if (err) { return send(err); }
      let playerId = player._id + '';
      admin.playerIds = [...admin.playerIds, playerId];
      admin.save(function(err) {
        if (err) { return next(err); }
      })
    });
  });
}


// GET /admin/player/:playerId
exports.get_player = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);
  const playerId = req.params.playerId + '';

  Player.findById({ _id: req.params.playerId }, function(err, player) {
    if (err) { return next(err); }
    if (!player) {
      return res.status(422).send({ error: 'Player not found'});
    }

    const playerInfo = {
      firstName: player.firstName,
      lastName: player.lastName,
      email: player.email,
      mobile: player.mobile,
      sport: player.sport,
      signupDate: player.signupDate,
      profileId: player.profileId,
      tileIds: player.tileIds
    }

    if (player.adminId == decoded.sub) {
      res.json(playerInfo);
    } else {
      res.send('You do not have access to this player account');
    }
  });
}

// PUT /admin/player/:playerId
exports.update_player = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);
  const playerId = req.params.playerId + '';

  Player.findById({ _id: req.params.playerId }, function(err, player) {
    if (err) { return next(err); }
    if (!player) {
      return res.status(422).send({ error: 'Player not found'});
    }

    if (player.adminId == decoded.sub) {
      player.firstName = req.body.firstName,
      player.lastName = req.body.lastName,
      player.email = req.body.email,
      player.mobile = req.body.mobile,
      player.sport = req.body.sport,
      player.signupDate = req.body.signupDate,
      player.profileId = req.body.profileId,
      player.save(function(err){
        if (err) { return next(err); }
        res.json(player);
      });
    } else {
      res.send('You do not have access to this player account');
    }
  });
}

// This will delete the player record completely - consider an alternative to make an account inactive or
// dissassociate account from this admin
// DELETE /admin/player/:playerId/
exports.delete_player = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Admin.findById({_id: decoded.sub }, function(err, admin) {
    if (admin.playerIds.includes(req.params.playerId)) {
      Player.remove({ _id: req.params.playerId }, function(err) {
        if (err) res.send(err);
        res.json({ message: "Player successfully deleted" });
      })
    }
  });
}
