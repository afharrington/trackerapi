const mongoose = require("mongoose");
const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../config/keys.js');
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/User/user_model');
const UserRegimen = require('../models/UserRegimen/user_regimen_model');

// ACCOUNT ROUTES ===========================================================>>

module.exports = {

  // GET  /user
  get_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let user = await User.findById({ _id: decoded.sub })
      .populate('userRegimen');
      res.status(200).send(user);
    } catch(err) {
      next(err);
    }
  },


  // PUT /
  update_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;

    try {
      let updatedUser = await User.findByIdAndUpdate(decoded.sub, props, {new: true});
      res.status(200).send(updatedUser);
    } catch(err) {
      next(err);
    }
  },


// REGIMEN ROUTES ===========================================================>>

  // GET /user
  get_regimens: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let user = await User.findById({ _id: decoded.sub }).populate('userRegimens');
      let userRegimens = user.userRegimens;
      res.status(200).send(userRegimens);
    } catch(err) {
      next(err);
    }
  },


  // GET /user/reg/:regId
  get_regimen: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regId } = req.params;

    try {
      let regimen = await UserRegimen.findById(regId);
      if (regimen.userId == decoded.sub) {
        res.status(200).send(regimen);
      } else {
        res.status(403).send('You do not have access to this regimen');
      }
    } catch(err) {
      next(err);
    }
  },


  // POST /user/reg/:regId/tile/:tileId
  add_entry: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regId, tileId } = req.params;

    const entry = {
      "activity": req.body.activity,
      "notes": req.body.notes,
      "minutes": req.body.minutes,
      "entryDate": req.body.entryDate
    }

    try {
      let regimen = await UserRegimen.findById(regId);
      if (regimen.userId == decoded.sub) {
        let now = new Date();
        let tile = regimen.userTiles.find(tile => tile._id == tileId);
        let currentCycleStart = tile.currentCycleStart;
        let current = moment(now);
        let recent = moment(currentCycleStart);
        let daysSince = current.diff(currentCycleStart, 'days');

        // If the last cycle has closed, refresh variables, start a new one and add the entry
        if (daysSince > tile.goalCycle || tile.cycles.length == 0) {
          tile.currentCycleStart = now;
          let newCycle = {
            cycleStartDate: now,
            cycleEntries: [entry],
            cycleLengthInDays: tile.goalCycle,
            cycleGoalInHours: tile.goalHours
          }

          tile.cycles = [newCycle, ...tile.cycles];
        } else {
          // Add entry to the current cycle
          tile.cycles[0].cycleEntries = [entry, ...tile.cycles[0].cycleEntries];
        }

        let updatedRegimen = await regimen.save();
        res.status(200).send(tile);
      } else {
        res.status(403).send('You do not have access to this regimen');
      }
    } catch(err) {
      next(err);
    }
  },


  // GET /user/reg/:regId/tile/:tileId
  get_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regId, tileId } = req.params;

    try {
      let regimen = await UserRegimen.findById(regId);
      if (regimen.userId == decoded.sub) {
        let tile = regimen.userTiles.find(tile => tile._id == tileId);
        res.status(200).send(tile);
      }
    } catch(err) {
      next(err);
    }
  },


  // PUT /user/reg/:regId/tile/:tileId/entry/:entryId
  update_entry: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regId, tileId, entryId } = req.params;

    let updatedEntry = {
      "activity": req.body.activity,
      "comments": req.body.comments
    }

    try {
      let regimen = await UserRegimen.findById(regId);
      if (regimen.userId == decoded.sub) {
        let tile = regimen.userTiles.find(tile => tile._id == tileId);
        tile.entries.forEach( (entry, i) => {
          if (entry._id == entryId) { tile.entries[i] = updatedEntry }
        });
        let updatedRegimen = await regimen.save();
        res.status(200).send(updatedRegimen);
      }
    } catch(err) {
      next(err);
    }
  },

  // DELETE /user/reg/:regId/tile/:tileId/entry/:entryId
  delete_entry: async(req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regId, tileId, entryId } = req.params;

    try {
      let regimen = await UserRegimen.findById(regId);
      if (regimen.userId == decoded.sub) {
        let tile = regimen.userTiles.find(tile => tile._id == tileId);

        let entry = tile.entries.find(entry => entry._id == entryId);
        let entryMinutes = entry.minutes;

        tile.entries = tile.entries.filter(entry => entry._id != entryId);

        tile.totalHoursLifetime -= (entryMinutes / 60);

        let updatedRegimen = await regimen.save();
        res.status(200).send(updatedRegimen);
      }
    } catch(err) {
      next(err);
    }
  },
}
