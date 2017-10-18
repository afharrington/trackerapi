const mongoose = require("mongoose");
const jwt = require('jwt-simple');
const config = require('../config/keys.js');
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Mongoose models and schemas
const Admin = require('../models/Admin/admin_model');
const User = require('../models/User/user_model');
const Regimen = require('../models/Regimen/regimen_model');
const UserRegimen = require('../models/UserRegimen/user_regimen_model');
const UserTile = require('../models/UserRegimen/user_tile_schema');


// MANAGING USER ACCOUNTS ==================================================>>

module.exports = {

  // Get all users managed by this admin
  // GET /admin/user
  get_all_users: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let admin = await Admin.findById(decoded.sub)
        .populate({
          path: 'users',
          populate: {
            path: 'userRegimens',
            model: 'userRegimen'
          }
        });
      let users = admin.users;
      res.status(200).send(users);
    } catch(err) {
      next(err);
    }
  },

  // Create a new user from admin dashboard - this assigns a registration code
  // but does not register the user with a password (that must be done by the user)
  // POST /admin/user
  create_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    let props = req.body; // user details
    props.adminId = decoded.sub; // adds adminId to user account

    try {
      let existingUser = await User.findOne({ email: props.email });
      if (existingUser) {
        res.send('This email is already registered for a user account');
      } else {

        let user = await User.create(props);

        if (props.regimen) {
          let regimen = await Regimen.findById({ _id: props.regimen });
          user.regimen = { regimen: regimen._id, regimenName: regimen.regimenName };
          let userName = `${user.firstName} ${user.lastName}`;

          // Based on that regimen, create an array of userRegimenTiles
          let userRegimenTiles = [];

          if (regimen.tiles) {
            regimen.tiles.forEach( tile => {

              // Start a new cycle when you start a new user regimen
              // CHANGE THIS TO TODAY'S DATE AFTER TESTING
              let newCycle = {
                cycleStartDate: new Date(),
                cycleLengthInDays: tile.goalCycle,
                cycleGoalInHours: tile.goalHours,
                cycleTotalMinutes: 0,
                color: 0
              }

              let userTile = {
                userName: userName,
                userId: user._id,
                fromTile: tile,
                userTileName: tile.tileName,
                goalCycle: tile.goalCycle,
                goalHours: tile.goalHours,
                activityOptions: tile.activityOptions,
                cycles: [newCycle]
              }
              userRegimenTiles.push(userTile);
            })
          }

          // Create a user regimen
          let userRegimen = await UserRegimen.create({
            userId: user._id,
            userName: userName,
            fromRegimen: regimen,
            userRegimenName: regimen.regimenName,
            userTiles: userRegimenTiles
          });

          user.userRegimen = userRegimen;

          let newUser = await user.save();
          res.status(200).send(newUser);
        } else {
          res.status(200).send(user);
        }

        // add new user to the admin's list
        let admin = await Admin.findById({ _id: decoded.sub });
        updatedUsers = [user, ...admin.users];
        await Admin.findByIdAndUpdate(decoded.sub, { users: updatedUsers });
      }
    } catch(err) {
      console.log(err);
      next(err);
    }
  },

  // Get a specific user
  // GET /admin/user/:userId
  get_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let user = await User.findById({ _id: req.params.userId }).populate('userRegimen');
      if (user) {
        if (user.adminId === decoded.sub) {
          res.status(200).send(user);
        } else {
          res.status(403).send('You do not have administrative access to this user');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  },


  // Edit a specific user's details
  // PUT /admin/user/:userId
  update_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);
      if (user) {
        if (user.adminId == decoded.sub) {
          let updatedUser = await User.findByIdAndUpdate(userId, props, {new: true});
          res.status(200).send(updatedUser);
        } else {
          res.status(403).send('You do not have administrative access to this user');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Delete a specific user
  // DELETE /admin/user/:userId
  delete_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { userId } = req.params;

    try {
      const user = await User.findById(userId);

      if (user) {
        if (user.adminId == decoded.sub) {
          await User.findByIdAndRemove(userId);

          // Also delete the userRegimen associated with this user
          let userRegimen = await UserRegimen.findOne({ userId: userId});
          await UserRegimen.findByIdAndRemove(userRegimen._id);

          res.status(200).send('User successfully deleted');

        } else {
          res.status(403).send('You do not have administrative access to this user');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Get a specific userTile with cycle data
  // GET /admin/user/:userId/usertile/:userTileId
  get_user_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { userId, userTileId } = req.params;
    try {
      const user = await User.findById(userId).populate('userRegimen');
      if (user) {
        if (user.adminId == decoded.sub) {
          let tile = user.userRegimen.userTiles.find( userTile => {
            return userTile._id == userTileId;
          })
          res.status(200).send(tile);
        } else {
          res.status(403).send('You do not have administrative access to this user');
        }
      } else {
        res.status(422).send({ error: 'Tile not found'});
      }
    } catch(err) {
      next(err);
    }
  },

// MANAGING REGIMENS =======================================================>>

  // Get all regimens associated with this admin
  // GET /admin/regimen
  get_all_regimens: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let admin = await Admin.findById({ _id: decoded.sub }).populate('regimens');
      let regimens = admin.regimens;
      res.status(200).send(regimens);
    } catch(err) {
      next(err);
    }
  },

  // Create a new regimen, to be used as a template for userRegimens
  // POST /admin/regimen
  create_regimen: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    props.adminId = decoded.sub;

    try {
      let regimen = await Regimen.create(props);
      let admin = await Admin.findByIdAndUpdate({ _id: decoded.sub });
      updatedRegimens = [regimen, ...admin.regimens];
      await Admin.findByIdAndUpdate(admin._id, { regimens: updatedRegimens});
      res.status(200).send(regimen);
    } catch(err) {
      next(err);
    }
  },

  // Get a specific regimen
  // GET /admin/regimen/:regimenId
  get_regimen: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let regimen = await Regimen.findById({ _id: req.params.regimenId });
      if (regimen) {
        if (regimen.adminId === decoded.sub) {
          res.status(200).send(regimen);
        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      } else {
        res.status(422).send({ error: 'Regimen not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Update regimen (used in the app to update the regimen's name)
  // PUT /admin/regimen/:regimenId
  update_regimen: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regimenId } = req.params;
    const props = req.body;

    try {
      const regimen = await Regimen.findById(regimenId);
      if (regimen) {
        if (regimen.adminId == decoded.sub) {
          let updatedRegimen = await Regimen.findByIdAndUpdate(regimenId, props, {new: true});

          // Also updates user regimens that are based on this regimen
          let userRegimens = await UserRegimen.find({ fromRegimen: regimenId});
          userRegimens.forEach( userRegimen => {
            userRegimen.userRegimenName = props.regimenName;
            userRegimen.save();
          })
          res.status(200).send(updatedRegimen);
        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      } else {
        res.status(422).send({ error: 'Regimen not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // TO DO: Decide whether or not this should delete the user regimens too
  // DELETE /admin/regimen/:regimenId
  delete_regimen: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regimenId } = req.params;
    const props = req.body;

    try {
      const regimen = await Regimen.findById(regimenId);
      if (regimen) {
        if (regimen.adminId == decoded.sub) {
          await Regimen.findByIdAndRemove(regimenId)
          res.status(200).send(regimenId);
        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      } else {
        res.status(422).send({ error: 'Regimen not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Get all of the userRegimens that were created with this regimen
  // GET /admin/regimen/:regimenId/users
  get_user_regimens: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regimenId } = req.params;
    const props = req.body;

    try {
      let regimen = await Regimen.findById({ _id: req.params.regimenId });
      if (regimen) {
        if (regimen.adminId == decoded.sub) {
          const userRegimens = await UserRegimen.find({ fromRegimen: regimenId});
          res.status(200).send(userRegimens);
        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      } else {
        res.status(422).send({ error: 'Regimen not found'});
      }
    } catch(err) {
      next(err);
    }
  },

// MANAGING TILES ===========================================================>>

  // Add a tile (template) to an existing regimen
  // POST /admin/regimen/:regimenId
  create_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regimenId } = req.params;
    const tile = req.body;

    try {
      const regimen = await Regimen.findById(regimenId);

      if (regimen) {
        if (regimen.adminId == decoded.sub) {
          regimen.tiles = [tile, ...regimen.tiles];
          let updatedRegimen = await regimen.save();

          let newTile = updatedRegimen.tiles[0];

          // If there are existing userRegimens based on this regimen, add a
          // matching userTile to each
          let userRegimens = await UserRegimen.find({ fromRegimen: regimenId});
          if (userRegimens) {
            userRegimens.forEach( userRegimen => {
              let newUserTile = {
                userName: userRegimen.userName,
                fromTile: newTile,
                userTileName: newTile.tileName,
                activityOptions: newTile.activityOptions,
                goalCycle: newTile.goalCycle,
                goalHours: newTile.goalHours
              }
              userRegimen.userTiles = [newUserTile, ...userRegimen.userTiles];
              userRegimen.save();
            });
          }

          res.status(200).send(updatedRegimen);
        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      } else {
        res.status(422).send({ error: 'Regimen not found'});
      }
    } catch(err) {
      next(err);
    }
  },


  // DELETE /admin/regimen/:regimenId/tile/:tileId
  delete_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regimenId, tileId } = req.params;

    try {
      const regimen = await Regimen.findById(regimenId);

      if (regimen) {
        if (regimen.adminId == decoded.sub) {
          regimen.tiles = regimen.tiles.filter(tile => tile._id != tileId);
          let updatedRegimen = await regimen.save();

          // If there are user regimens based on this regimen, remove the matching
          // userTile from each userRegimen

          // TO DO: Alert admin and user that this will delete records

          let userRegimens = await UserRegimen.find({ fromRegimen: regimenId});

          if (userRegimens) {
            userRegimens.forEach(userRegimen => {
              userRegimen.userTiles = userRegimen.userTiles.filter(userTile => userTile.fromTile != tileId);
              userRegimen.save();
            });
          }

          res.status(200).send(updatedRegimen);
        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      } else {
        res.status(422).send({ error: 'Regimen not found'});
      }
    } catch(err) {
      next(err);
    }
  },


  // PUT /admin/regimen/:regimenId/tile/:tileId
  update_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regimenId, tileId } = req.params;
    const { tileName, mode, activityOptions, goalHours, goalCycle} = req.body;

    try {
      const regimen = await Regimen.findById(regimenId);


      if (regimen) {

        // Update regimen tile
        if (regimen.adminId == decoded.sub) {

          regimen.tiles.forEach((tile, i) => {
            if (tile._id == tileId) {
              tile.tileName = tileName;
              tile.activityOptions = activityOptions;
              tile.goalHours = goalHours;
              tile.goalCycle = goalCycle;
          }
          });

          let updatedRegimen = await regimen.save({new: true});

          // // If there are existing userRegimens based on this regimen
          let userRegimens = await UserRegimen.find({ fromRegimen: regimenId});

          if (userRegimens) {
           // Repeat for each userRegimen based on this regimen
           userRegimens.forEach(userRegimen => {

              let tileIndex = userRegimen.userTiles.findIndex(userTile => {
                return userTile.fromTile == tileId;
              });

              userRegimen.userTiles[tileIndex].userTileName = tileName;
              userRegimen.userTiles[tileIndex].activityOptions = activityOptions;
              userRegimen.userTiles[tileIndex].goalHours = goalHours;
              userRegimen.userTiles[tileIndex].goalCycle = goalCycle;

              userRegimen.save();

            });
          }

          res.status(200).send(updatedRegimen);

        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      } else {
        res.status(422).send({ error: 'Regimen not found'});
      }
    } catch(err) {
      next(err);
    }
  },


  // GET /admin/regimen/:regimenId/tile/:tileId/users
  get_user_tiles: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regimenId, tileId } = req.params;
    const props = req.body;

    try {
      let regimen = await Regimen.findById({ _id: req.params.regimenId });
      if (regimen) {
        if (regimen.adminId == decoded.sub) {
          let userRegimens = await UserRegimen.find({ fromRegimen: regimenId});

          let tiles = userRegimens.map(userRegimen => {
            return userRegimen.userTiles.find(userTile => {
              return userTile.fromTile.toString() == tileId;
            });
          });
          res.status(200).send(tiles);
        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      } else {
        res.status(422).send({ error: 'Regimen not found'});
      }
    } catch(err) {
      next(err);
    }
  },


  // POST /admin/regimen/:regimenId/tile/:tileId
  add_activity: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const activity = req.body.activity;

    try {
      const regimen = await Regimen.findById(req.params.regimenId);

      if (regimen) {
        if (regimen.adminId == decoded.sub) {
          regimen.tiles.forEach( (tile, i) => {
            if (tile._id == req.params.tileId) {
              regimen.tiles[i].activityOptions = [...regimen.tiles[i].activityOptions, activity];
            }
          });
          let updatedRegimen = await regimen.save();
          res.status(200).send(updatedRegimen);
        } else {
          res.status(403).send('You do not have administrative access to this regimen');
        }
      }
    } catch(err) {
      next(err);
    }
  }
}
