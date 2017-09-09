const mongoose = require("mongoose");
const jwt = require('jwt-simple');
const config = require('../config/keys.js');
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/User/user_model');

// Token for Testing:
// bob@gmail.com/ password
// eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1OWFkZjQzOGU1ZTRmMDBlNjAzYThjZWUiLCJpYXQiOjE1MDQ1NzI3MTk1NDR9.3BB2IqcyLZyT7WqI8AZY2zo0Utx-Ga7fwU2ptIVGj9Q

// GET /
exports.get_player_dashboard = function(req, res) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Player.findById({ _id: decoded.sub }, function(err, player) {
    if (err) res.send(err)
    const playerDetails = {
      "firstName": player.first_name,
      "lastName": player.last_name,
      "email": player.email,
      "mobile": player.mobile,
      "sport": player.sport,
      "signupDate": player.signupDate,
      "tiles": player.tiles
    }
    res.json(playerDetails);
  });
};
