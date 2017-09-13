const mongoose = require("mongoose");
const jwt = require('jwt-simple');
const config = require('../config/keys.js');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const ObjectID = require("mongodb").ObjectID;

// Mongoose models and schemas
const Admin = require('../models/Admin/admin_model');
const User = require('../models/User/user_model');
const Regimen = require('../models/Regimen/regimen_model');
const Tile = require('../models/Tile/tile_model');
const UserRegimen = require('../models/User/user_regimen_schema');
const UserTile = require('../models/User/user_tile_schema');


// HELPER FUNCTIONS =========================================================>>

function generateUserRegimens(regimensArray) {
  userRegimens = [];
  regimensArray.forEach(regimen => {
      let userRegimen = {
        userRegimenName: regimen.regimenName,
        userTiles: []
      };

      if(regimen.tiles) {
        regimen.tiles.forEach(tile => {
          let userTile = {
            userTileName: tile.tileName,
            mode: tile.mode,
            continuousHours: tile.continuousHours,
            continuousDays: tile.continuousDays,
            goalHours: tile.goalHours,
            activityOptions: tile.activityOptions
          }
          userRegimen.userTiles.push(userTile);
        });
      userRegimens.push(userRegimen);
      }
  });
  return userRegimens;
};

module.exports = {

// ADMIN FUNCTIONS =========================================================>>


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

// USER FUNCTIONS ===========================================================>>

  // POST /admin/user
  create_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    let props = req.body;
    props.adminId = decoded.sub;

    try {
      let user = await User.findOne({ email: props.email });
      if (!user) {
        let newUser = await User.create(props);
        res.status(200).send(newUser);
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
      let user = await User.findById({ _id: req.params.userId });
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


  // POST /admin/user/:userId
  assign_regimens: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const regimenId = req.body.regimenId;
    const { userId } = req.params;

    try {
      let user = await User.findById(userId);

      // Ensure on client side that the same regimen can't be added twice
      if (user) {
        if (user.adminId == decoded.sub) {
          let regimen = await Regimen.findById({ _id: regimenId });
          let updatedRegimens = [...user.regimens, regimen];
          let updatedUser = await User.findByIdAndUpdate(user._id, { regimens: updatedRegimens }, { new: true }).populate('regimens');
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


// REGIMEN FUNCTIONS ======================================================>>

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


}
