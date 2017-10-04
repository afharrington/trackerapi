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

  // POST /admin/user
  create_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    let props = req.body; // user details
    props.adminId = decoded.sub; // adds adminId to user account

    try {
      let user = await User.findOne({ email: props.email });

      if (!user) {

        // Find the regimen
        let regimen = await Regimen.findById({ _id: props.regimen });
        props.regimen = { regimen: regimen._id, regimenName: regimen.regimenName };

        // Create a new user
        let user = await User.create(props);


        // Based on that regimen, create an array of userRegimenTiles
        let userRegimenTiles = [];
        if (regimen.tiles) {
          regimen.tiles.forEach( tile => {
            let userTile = {
              fromTile: tile,
              userTileName: tile.tileName,
              goalCycle: tile.goalCycle,
              goalHours: tile.goalHours,
              activityOptions: tile.activityOptions
            }
            userRegimenTiles.push(userTile);
          })
        }

        // Create a user regimen
        let userRegimen = await UserRegimen.create({
          userId: user._id,
          fromRegimen: regimen,
          userRegimenName: regimen.regimenName,
          userTiles: userRegimenTiles
        });

        await User.findByIdAndUpdate(user._id, { userRegimen: userRegimen });

        // add new user to the admin's list
        let admin = await Admin.findById({ _id: decoded.sub });
        updatedUsers = [...admin.users, user];
        await Admin.findByIdAndUpdate(decoded.sub, { users: updatedUsers });
        res.status(200).send(user);
      } else {
        res.status(409).send('This email is already registered for a user account');
      }
    } catch(err) {
      next(err);
    }
  },


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
          await User.findByIdAndRemove(userId)
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

  // GET /admin/user/:userId/usertile/:userTileId
  get_user_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { userId, userTileId } = req.params;
    try {
      const user = await User.findById(userId).populate('userRegimen');
      if (user) {
        console.log(user);
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

  // POST /admin/regimen
  create_regimen: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    props.adminId = decoded.sub;

    try {
      let regimen = await Regimen.create(props);
      let admin = await Admin.findByIdAndUpdate({ _id: decoded.sub });
      updatedRegimens = [...admin.regimens, regimen];
      await Admin.findByIdAndUpdate(admin._id, { regimens: updatedRegimens});
      res.status(200).send(regimen);
    } catch(err) {
      next(err);
    }
  },


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
          res.status(200).send('Regimen successfully deleted');
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
          regimen.tiles = [...regimen.tiles, tile];
          let updatedRegimen = await regimen.save();
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

    let updatedTile = {
      tileName: req.body.tileName,
      mode: req.body.mode,
      activityOptions: req.body.activityOptions,
      continuousHours: req.body.continuousHours,
      continuousDays: req.body.continuousDays,
      goalHours: req.body.goalHours,
      goalCycle: req.body.goalCycle
    }

    try {
      const regimen = await Regimen.findById(regimenId);

      if (regimen) {
        if (regimen.adminId == decoded.sub) {
          regimen.tiles.forEach( (tile, i) => {
            if (tile._id == tileId) { regimen.tiles[i] = updatedTile }
          });
          let updatedRegimen = await regimen.save({new: true});
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
