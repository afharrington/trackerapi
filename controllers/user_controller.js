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
      .populate('userRegimens').populate('activeUserRegimen').populate('regimens');
      res.status(200).send(user);
    } catch(err) {
      next(err);
    }
  },


  // PUT /
  update_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      const user = await User.findById(decoded.sub)  .populate('userRegimens').populate('activeUserRegimen').populate('regimens');

      user.firstName = req.body.firstName;
      user.lastName = req.body.lastName;
      user.email = req.body.email;

      let updatedUser = await user.save();

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

        let tile = regimen.userTiles.find(tile => tile._id == tileId);
        let cycles = tile.cycles;

        // See if the entry dates fit within an existing cycle
        let thisEntryCycle = cycles.find(cycle => {
          let cycleStartDate = moment(cycle.cycleStartDate).startOf('day');
          let cycleEndDate = moment(cycle.cycleEndDate).startOf('day');
          return moment(entry.entryDate).isBetween(cycleStartDate, cycleEndDate, null, '[]');
        });


        // Function Start ---------------------------->>
        function createNewCycle(firstCycleStartDate) {
          // If current date is within most recent cycle
          if (moment(entry.entryDate).isSameOrAfter(firstCycleStartDate)) {
            return;
          } else {
            let cycleStartDate = moment(firstCycleStartDate).subtract((tile.goalCycle + 1), 'days');
            let newCycle = {
              cycleStartDate: cycleStartDate,
              cycleLengthInDays: tile.goalCycle,
              cycleGoalInHours: tile.goalHours,
              cycleTotalMinutes: 0
            }
            // cycleEndDate and cycleNextDate will be created by Mongoose middleware (see cycle schema)
            tile.cycles = [...tile.cycles, newCycle];
            return createNewCycle(newCycle.cycleStartDate);
          };
        }
        // Function End ---------------------------->>


        // If entry fits in an existing cycle, add the entry
        if (thisEntryCycle) {
          thisEntryCycle.cycleEntries = [entry, ...thisEntryCycle.cycleEntries];
        } else {
          let firstCycleStartDate = tile.cycles[cycles.length-1].cycleStartDate;

          // Create cycles until the new entry fits in one of them
          createNewCycle(firstCycleStartDate);

          // See if the entry dates fit within an existing cycle
          thisEntryCycle = tile.cycles.find(cycle => {
            let cycleStartDate = cycle.cycleStartDate;
            let cycleEndDate = cycle.cycleEndDate;
            return moment(entry.entryDate).isBetween(cycleStartDate, cycleEndDate, null, '[]');
          });

          thisEntryCycle.cycleEntries = [entry, ...thisEntryCycle.cycleEntries];
        }

        let user = await User.findById(decoded.sub);
        let admin = await Admin.findById(user.adminId);

        admin.recentActivity = [entry, ...admin.recentActivity];
        if (admin.recentActivity.length > 100) {
          admin.recentActivity.pop();
        }
        admin.recentActivity = admin.recentActivity.sort(function(a, b){
          return b.entryDate == a.entryDate ? 0 : +(b.entryDate > a.entryDate) || -1;
        });

        await admin.save();
        await regimen.save();
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
        let recentCycle = tile.cycles[0];

        // Recursively create cycles at the set interval, between the most recent cycle and today
        function createNewCycle(mostRecentCycleNextDate) {
          // If current date is within most recent cycle
          if (moment().isBefore(mostRecentCycleNextDate)) {
            return;

          // Else if there is a gap between most recent cycle and today
          } else {
            let newCycle = {
              cycleStartDate: mostRecentCycleNextDate,
              cycleLengthInDays: tile.goalCycle,
              cycleGoalInHours: tile.goalHours,
              cycleTotalMinutes: 0
            }

            // cycleEndDate and cycleNextDate will be created by Mongoose middleware (see cycle schema)
            tile.cycles = [newCycle, ...tile.cycles];
            let cycleNextDate = moment(newCycle.cycleStartDate).add(tile.goalCycle + 1, 'days')
            return createNewCycle(cycleNextDate);
          };
        }

        createNewCycle(recentCycle.cycleNextDate);
        await regimen.save();
        res.status(200).send(tile);
      }
    } catch(err) {
      next(err);
    }
  },


  // PUT /admin/user/:userId
  // update_user: async (req, res, next) => {
  //   const header = req.headers.authorization.slice(4);
  //   const decoded = jwt.decode(header, config.secret);
  //   const props = req.body;
  //   const { userId } = req.params;
  //
  //   try {
  //     const user = await User.findById(userId);
  //     if (user) {
  //       if (user.adminId == decoded.sub) {
  //         let updatedUser = await User.findByIdAndUpdate(userId, props, {new: true});
  //         res.status(200).send(updatedUser);
  //       } else {
  //         res.status(403).send('You do not have administrative access to this user');
  //       }
  //     } else {
  //       res.status(422).send({ error: 'User not found'});
  //     }
  //   } catch(err) {
  //     next(err);
  //   }
  // },


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

        // // This deletes the entire cycle if there are no entries in it - keep disabled for now
        cycle.cycleTotalMinutes = cycle.cycleTotalMinutes - entryMinutes;
        if (cycle.cycleEntries.length == 0) {
          cycle.color = 0;
        }

        await regimen.save();
        res.status(200).send(tile);
      }
    } catch(err) {
      next(err);
    }
  },
}
