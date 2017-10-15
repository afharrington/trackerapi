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
        let today = new Date();
        let tile = regimen.userTiles.find(tile => tile._id == tileId);
        let cycles = tile.cycles;
        let lastCycle = tile.cycles.length - 1;

        // Check if the entry fits into an existing cycle
        let thisEntryCycle = cycles.find(cycle => {
          let cycleStartDate = cycle.cycleStartDate;
          let cycleEndDate = cycle.cycleEndDate;
          return moment(entry.entryDate).isBetween(cycleStartDate, cycleEndDate, null, '[]');
        });

        if (thisEntryCycle) {
          thisEntryCycle.cycleEntries = [entry, ...thisEntryCycle.cycleEntries];

          // If there are no entries yet or it does not fit in an existing cycle, create a new cycle
          // Client-side rendering of the date picker will make sure there are no gaps in the cycle
        } else if (cycles.length == 0 || (!(thisEntryCycle) && moment(entry.entryDate).isAfter(tile.cycles[lastCycle].cycleStartDate))) {

          let newCycle = {
            cycleStartDate: new Date(entry.entryDate),
            cycleEntries: [entry],
            cycleLengthInDays: tile.goalCycle,
            cycleGoalInHours: tile.goalHours
          }

          tile.cycles = [newCycle, ...tile.cycles];
        }

        // Right now, NOTHING happens if the entry comes BEFORE an existing cycle

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


  // PUT /user/reg/:regId/tile/:tileId/cycle/:cycleId/entry/:entryId
  update_entry: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { regId, tileId, cycleId, entryId } = req.params;

    try {
      let regimen = await UserRegimen.findById(regId);
      if (regimen.userId == decoded.sub) {

        let tile = regimen.userTiles.find(tile => tile._id == tileId);
        let cycle = tile.cycles.find(cycle => cycle._id == cycleId);
        let entry = cycle.cycleEntries.find(entry => entry._id == entryId);

        entry.entryDate = req.body.entryDate;
        entry.activity = req.body.activity;
        entry.notes = req.body.notes;
        entry.minutes = req.body.minutes


        // sort entries in order
        cycle.cycleEntries = cycle.cycleEntries.sort((a, b) => a.entryDate - a.entryDate);

        regimen.save({new: true});
        res.status(200).send(tile);
      }
    } catch(err) {
      next(err);
    }
  },


  // DELETE /user/reg/:regId/tile/:tileId/cycle/:cycleId/entry/:entryId
  delete_entry: async(req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regId, tileId, cycleId, entryId } = req.params;

    try {
      let regimen = await UserRegimen.findById(regId);
      if (regimen.userId == decoded.sub) {

        let tile = regimen.userTiles.find(tile => tile._id == tileId);
        let cycle = tile.cycles.find(cycle => cycle._id == cycleId);
        let entry = cycle.cycleEntries.find(entry => entry._id == entryId);
        let entryMinutes = entry.minutes;


        cycle.cycleEntries = cycle.cycleEntries.filter(entry => entry._id != entryId);

        // This deletes the entire cycle if there are no entries in it - keep disabled for now

        // if (cycle.cycleEntries.length == 0) {
        //   tile.cycles = tile.cycles.filter(existingCycle => existingCycle._id !== cycle._id);
        // }

        regimen.save();
        res.status(200).send(tile);
      }
    } catch(err) {
      next(err);
    }
  },
}
