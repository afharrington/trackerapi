const mongoose = require("mongoose");

const Admin = require("../models/AdminModel.js");
const Player = require("../models/PlayerModel.js");
const Profile = require("../models/ProfileModel.js");
const TileSet = require("../models/TileSetSchema.js");
const TileProfile = require("../models/TileProfileSchema.js");
const Tile = require("../models/TileSchema.js");

const jwt = require('jwt-simple');
const config = require('../config/keys.js');
const ExtractJwt = require('passport-jwt').ExtractJwt;

// When admins update a profile, need to have those changes propagate among all
// players using that profile


// TEST ACCOUNT
// Anna
// Harrington
// email
// password
// JWT eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiI1OWFkYTQxYmRiMTk1ZjBhMDVhZTY4NjEiLCJpYXQiOjE1MDQ1NTE5NjQyMjZ9.iLUd87Qcm0qpoJvq3nm32wiYj6OZY31YUPOOkqxCLUo

// GET /admin
exports.get_admin_dashboard = function(req, res) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Admin.findById({ _id: decoded.sub }, function(err, admin) {
    if (err) res.send(err)
    const adminDetails = {
      "firstName": admin.first_name,
      "lastName": admin.last_name,
      "email": admin.email,
      "profiles": admin.profiles,
      "playerIds": admin.player_ids
    }
    res.json(adminDetails);
  });
};

// PLAYER FUNCTIONS =========================================================>>

function generateTileSets(profileIds, callback) {
  profileIds.forEach((profileId) => {
    Profile.findById({_id: profileId}, function(err, profile) {
      console.log("finding profile");
      if (err) { return next(err); }
    })
    .then((profile) => {
      console.log("found:", profile);
    });
  }, () => {
    console.log("callback");
  });
}


// Creates a tile set for a single profile id
function generateTileSet(profileIds, callback) {
  let tileSets = profileIds.map((profileId) => {
    Profile.findById({ _id: profileId }, function(err, profile) {
      if (err) { return next(err); }

      let newTileSet = {
        tile_set_name: profile.profile_name,
        tile_set_profile: profileId,
        tiles: []
      };

      newTileSet.tiles = profile.tile_profiles.map(tileProfile => {
        const newTile = {
          tile_profile_id: tileProfile._id,
          tile_name: tileProfile.tile_name,
          mode: tileProfile.mode,
          goal_cycle: tileProfile.goal_cycle,
          goal_hours: tileProfile.goal_hours,
          continuous_days: tileProfile.continuous_days,
          continuous_hours: tileProfile.continuous_hours
        };
        return newTile;
      });
      // console.log("about to call back");
      // callback(newTileSet);
    });
    return newTileSet;
  });
console.log(tileSets);
}


// POST admin/player
exports.add_player = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Player.findOne({ email: req.body.email }, function(err, existingUser) {
    if (err) { return next(err); }
    if (existingUser) {
      return res.status(422).send({ error: 'A player with this email address already exists'});
    }

    const player = new Player({
      first_name: req.body.firstName,
      last_name: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      mobile: req.body.mobile,
      sport: req.body.sport,
      signup_date: req.body.signupDate,
      admin_id: decoded.sub,
      profile_ids: req.body.profileIds, // this will be an array of profile ids
      tileSets: [] // this will be an array of tileSet objects
    });

    // PROBLEM:
    if (req.body.profileIds) {
      generateTileSets(req.body.profileIds, (tileSets) => {
        console.log(tileSets);
      });
    }

    player.save(function(err){
      if (err) { return next(err); }
      res.json(player);
    });


    Admin.findById({ _id: decoded.sub }, function(err, admin) {
      if (err) { return send(err); }
      let player_id = player._id + '';
      admin.player_ids = [...admin.player_ids, player_id];
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

  Player.findById({ _id: req.params.playerId }, function(err, player) {
    if (err) { return next(err); }
    if (!player) {
      return res.status(422).send({ error: 'Player not found'});
    }

    const playerInfo = {
      firstName: player.first_name,
      lastName: player.last_name,
      email: player.email,
      mobile: player.mobile,
      sport: player.sport,
      signupDate: player.signup_Date,
      profileId: player.profile_id,
      tileSets: player.tileSets
    }

    if (player.admin_id == decoded.sub) {
      res.json(playerInfo);
    } else {
      res.send({ error: 'You do not have access to this player account' });
    }
  });
}

// PUT /admin/player/:playerId
exports.update_player = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Player.findById({ _id: req.params.playerId }, function(err, player) {
    if (err) { return next(err); }
    if (!player) {
      return res.status(422).send({ error: 'Player not found'});
    }

    if (player.admin_id !== decoded.sub) {
      res.send({ error: 'You do not have access to this profile' });
    } else {
      player.first_name = req.body.firstName ? req.body.firstName : player.first_name;
      player.last_name = req.body.lastName ? req.body.lastName : player.last_name;
      player.email = req.body.email ? req.body.email : player.email;
      player.mobile = req.body.mobile ? req.body.email : player.mobile;
      player.sport = req.body.sport ? req.body.sport : player.sport;
      player.signup_date = req.body.signupDate ? req.body.signupDate : player.signup_date;

      if (!req.body.profileIds) {
        player.profileIds = player.profileIds;
      } else {

        // save profiles that are in the request and not the current player info
        const newProfiles = req.body.profileIds.filter((reqProfileId) => {
          return !(player.profile_ids.includes(reqProfileId));
        })

        // for each new profile
        newProfiles.forEach((profileId) => {

          // look up the profile and create a matching tile set, add it to the player's tile sets
          Profile.findById({ _id: profileId })
          .then((profile) => {
            const tileSet = {
              tile_set_name: profile.profile_name,
              tile_set_profile: req.body.profileId,
              tiles: []
            };
            profile.tile_profiles.forEach(tileProfile => {
              const tile = {
                tile_profile_id: tileProfile._id,
                tile_name: tileProfile.tile_name,
                mode: tileProfile.mode,
                goal_cycle: tileProfile.goal_cycle,
                goal_hours: tileProfile.goal_hours,
                continuous_days: tileProfile.continuous_days,
                continuous_hours: tileProfile.continuous_hours
              };
              tileSet.tiles = [...tileSet.tiles, tile];
            });
            player.tileSets = [...player.tileSets, tileSet];
          })
          .catch(function(err) {
            console.log(err);
          })
        });
      }

      console.log(player.tileSets);

      player.save(function(err){
        if (err) { return next(err); }
        res.json(player);
      });
    }
  });
}

// This will delete the player record completely - consider an alternative to make an account inactive or
// dissassociate account from this admin
// DELETE /admin/player/:playerId
exports.delete_player = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Admin.findById({_id: decoded.sub }, function(err, admin) {
    if (err) { return next(err); }
    if (admin.player_ids.includes(req.params.playerId)) {
      Player.remove({ _id: req.params.playerId }, function(err) {
        if (err) res.send(err);
        res.json({ message: "Player successfully deleted" });
      })
    }
  });
}

// PROFILE FUNCTIONS ========================================================>>

// POST /admin/profile
exports.create_profile = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Admin.findById({_id: decoded.sub }, function(err, admin) {
    if (err) { return next(err); }
    let error = false;

    if (admin.profiles.length > 0) {
      admin.profiles.forEach(profile => {
        if (profile.profile_name == req.body.profileName) {
          error = true;
        }
      });
    }

    if (!error) {
      const newProfile = new Profile({
        profile_name: req.body.profileName,
        admin_id: decoded.sub
      });

      admin.profiles = [...admin.profiles, { profile_id: newProfile._id + '', profile_name: newProfile.profile_name }];
      admin.save(function(err) {
        if (err) { return next(err); }
      });

      newProfile.save(function(err){
        if (err) { return next(err); }
        res.json(newProfile);
      });
    } else if (error) {
      res.status(422).send({ error: 'A profile with this name already exists'});
    }
  });
}

// GET /admin/profile/:profileId
exports.get_profile = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Profile.findById({ _id: req.params.profileId }, function(err, profile) {
    if (err) { return next(err); }
    if (!profile) {
      return res.status(422).send({ error: 'Profile not found'});
    }

    const profileInfo = {
      profileName: profile.profile_name,
      tileIds: profile.tile_ids,
      createdDate: profile.created_date
    }

    if (profile.admin_id == decoded.sub) {
      res.json(profileInfo);
    } else {
      res.send({ error: 'You do not have access to this profile' });
    }
  });
}

// PUT /admin/profile/:profileId
exports.update_profile = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Profile.findById({ _id: req.params.profileId }, function(err, profile) {
    if (err) { return next(err); }
    if (!profile) {
      return res.status(422).send({ error: 'Profile not found'});
    }

    if (profile.admin_id == decoded.sub) {
      profile.profile_name = req.body.profileName ? req.body.profileName : profile.profile_name;
      profile.save(function(err){
        if (err) { return next(err); }
        res.json(profile);
      });
    } else {
      return res.status(422).send({ error: 'You do not have access to this profile'});
    }
  });
}

// DELETE /admin/profile/:profileId
exports.delete_profile = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Admin.findById({_id: decoded.sub }, function(err, admin) {
    if (err) { return next(err); }

    admin.profiles.forEach(profile => {
      if (profile.profile_id == req.params.profileId) {
        Profile.remove({ _id: req.params.profileId }, function(err) {
          if (err) res.send(err);
          res.json({ message: "Profile successfully deleted" });
        })
      }
    })
  });
}


// POST /admin/profile/:profileId
exports.create_tile_profile = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Profile.findById({_id: req.params.profileId }, function(err, profile) {
    if (err) { return next(err); }

    if (profile.admin_id == decoded.sub) {
      const tile = {
        tile_name: req.body.tileName,
        mode: req.body.mode,
        continuous_hours: req.body.continuousHours,
        continuous_days: req.body.continuousDays,
        goal_hours: req.body.goalHours,
        goal_cycle: req.body.goalCycle
      };

      profile.tile_profiles = [...profile.tile_profiles, tile];

      profile.save(function(err){
        if (err) { return next(err); }
        res.json(tile);
      });
    } else {
      res.status(422).send({ error: 'You do not have access to this profile'});
    }
  });
}

// GET /admin/profile/:profileId/tileprofile/:tileProfileId
exports.get_tile_profile = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Profile.findById({_id: req.params.profileId }, function(err, profile) {
    if (err) { return next(err); }

    if (!profile) {
      return res.status(422).send({ error: 'Profile not found'});
    }

    if (profile.admin_id == decoded.sub) {
      let tile = profile.tile_profiles.find(function(profile) {
        return profile._id == req.params.tileProfileId
      });
      res.send(tile);
    } else {
      res.status(422).send({ error: 'You do not have access to this profile'});
    }
  });
}

// PUT /admin/profile/:profileId/tileprofile/:tileProfileId
exports.update_tile_profile = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Profile.findById({_id: req.params.profileId }, function(err, profile) {
    if (err) { return next(err); }
    if (!profile) {
      return res.status(422).send({ error: 'Profile not found'});
    }

    if (profile.admin_id == decoded.sub) {
      let tile = profile.tile_profiles.find(function(profile) {
        return profile._id == req.params.tileProfileId
      });

      tile.tile_name = req.body.tileName ? req.body.tileName : tile.tile_name;
      tile.mode = req.body.mode ? req.body.mode : tile.mode;
      tile.continuous_hours = req.body.continuousHours ?  req.body.continuousHours : tile.continuous_hours;
      tile.continuous_days = req.body.continuousDays ? req.body.continuousDays : tile.continuous_days;
      tile.goal_hours = req.body.goalHours ? req.body.goalHours : tile.goal_hours;
      tile.goal_cycle = req.body.goalCycle ? req.body.goalCycle : tile.goal_cycle;

      tile.save(function(err){
        if (err) { return next(err); }
        res.json(tile);
      });
    } else {
      res.send('You do not have access to this profile');
    }
  });
}

// Delete /admin/profile/:profileId/tileprofile/:tileProfileId
exports.delete_tile_profile = function(req, res, next) {
  const header = req.headers.authorization.slice(4);
  const decoded = jwt.decode(header, config.secret);

  Profile.findById({_id: req.params.profileId }, function(err, profile) {
    if (err) { return next(err); }
    if (!profile) {
      return res.status(422).send({ error: 'Profile not found'});
    }

    if (profile.admin_id == decoded.sub) {
      let tileIndex = profile.tile_profiles.findIndex(function(profile) {
        return profile._id == req.params.tileProfileId
      });

      profile.tile_profiles.splice(tileIndex, 1);

      profile.save(function(err){
        if (err) { return next(err); }
        res.json(profile);
      });
    } else {
      res.send('You do not have access to this profile');
    }
  });
}
