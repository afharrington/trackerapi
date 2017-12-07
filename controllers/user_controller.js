const mongoose = require("mongoose");
const jwt = require('jwt-simple');
const moment = require('moment');
const config = require('../config/keys.js');
const ExtractJwt = require('passport-jwt').ExtractJwt;

// Mongoose models and schemas
const Admin = require('../models/admin_model');
const User = require('../models/user_model');
const Program = require('../models/program_model');
const Tile = require('../models/tile_model');
const UserProgram = require('../models/user_program_model');
const UserTile = require('../models/user_tile_model');
const Cycle = require('../models/cycle_model');
const Entry = require('../models/entry_model');


// ACCOUNT ROUTES ===========================================================>>

module.exports = {

  // GET  /user
  get_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let user = await User.findById({ _id: decoded.sub }).populate('activeUserProgram');
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
      const user = await User.findById(decoded.sub)  .populate('userPrograms').populate('activeUserProgram').populate('programs');

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

  // Get tiles from this user program
  // GET /user/tiles
  get_active_program_tiles: async(req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      const user = await User.findById(decoded.sub).populate('activeUserProgram');

      if (user) {
        let userProgramId = user.activeUserProgram._id;
        const userTiles = await UserTile.find({ userProgramId: userProgramId }).populate('cycles');
        res.status(200).send(userTiles);
      } else {
        res.status(422).send({ error: 'User program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // GET /user
  get_programs: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let user = await User.findById({ _id: decoded.sub }).populate('userPrograms');
      let userPrograms = user.userPrograms;
      res.status(200).send(userPrograms);
    } catch(err) {
      next(err);
    }
  },


  // GET /user/reg/:regId
  get_program: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { regId } = req.params;

    try {
      let program = await UserProgram.findById(regId);
      if (program.userId == decoded.sub) {
        res.status(200).send(program);
      } else {
        res.status(403).send('You do not have access to this program');
      }
    } catch(err) {
      next(err);
    }
  },


  // GET /user/tile/:userTileId
  get_user_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { userTileId } = req.params;

    try {
      let userTile = await UserTile.findById(userTileId)
        .populate({
          path: 'cycles',
          populate: {
            path: 'cycleEntries',
            model: 'entry'
          }
        });
      if (userTile.userId == decoded.sub) {
        res.status(200).send(userTile).populate('cycles');
      } else {
        res.status(403).send('You do not have access to this tile');
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

  // POST /user/tile/:userTileId
  add_entry: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { userTileId } = req.params;
    const props = req.body;
    if (props.entryDate == undefined) {
      props.entryDate = new Date();
    }

    try {
      const userTile = await UserTile.findById(userTileId).populate('cycles');
      if (userTile) {

        if (userTile.userId == decoded.sub) {
          let cycles = userTile.cycles;

          const user = await User.findById(decoded.sub);

          let entry = await Entry.create({
            adminId: user.adminId,
            userId: decoded.sub,
            userName: userTile.userName,
            userProgramId: userTile.userProgramId,
            userTileName: userTile.userTileName,
            userTileId: userTile._id,
            tileId: userTile.tileId,
            activity: props.activity,
            notes: props.notes,
            minutes: props.minutes,
            entryDate: props.entryDate
          });

          // See if the new entry fits within an existing cycle
          function checkForMatchingCycle() {
            return cycles.find(cycle => {
              let cycleStartDate = moment(cycle.cycleStartDate).startOf('day');
              let cycleEndDate = moment(cycle.cycleEndDate).startOf('day');

              if (moment(props.entryDate).isBetween(cycleStartDate, cycleEndDate, null, '[]')) {
                return cycle;
              } else {
                return null;
              }
            });
          }

          // Creates new cycles if needed
          // Function Start ---------------------------->>
          function createNewCycle(firstCycleStartDate) {

            if (moment(entry.entryDate).isSameOrAfter(firstCycleStartDate)) {

              // Stop creating cycles and return the earliest cycle
              return userTile.cycles[userTile.cycles.length - 1];
            } else {
              let cycleStartDate = moment(firstCycleStartDate).subtract((userTile.goalCycle + 1), 'days');

              let newCycle = new Cycle({
                adminId: user.adminId,
                userId: decoded.sub,
                tileId: userTile.tileId,
                cycleStartDate: cycleStartDate,
                cycleLengthInDays: userTile.goalCycle,
                cycleGoalInHours: userTile.goalHours,
                cycleTotalMinutes: 0
              });
              newCycle.save();

              // cycleEndDate and cycleNextDate will be created by Mongoose middleware (see cycle schema)
              // Add the cycle to the userTile
              userTile.cycles = [...userTile.cycles, newCycle];
              userTile.save();

              return createNewCycle(newCycle.cycleStartDate);
            };
          }
          // Function End ---------------------------->>

          function addEntryToCycle(cycle) {
            cycle.cycleEntries = [entry, ...cycle.cycleEntries];
            cycle.cycleEntries = cycle.cycleEntries.sort(function(a,b) {
              return b.entryDate == a.entryDate ? 0 : +(b.entryDate > a.entryDate) || -1;
            });
            cycle.cycleTotalMinutes = cycle.cycleTotalMinutes += entry.minutes;
            cycle.save();
          }

          // First change if the entry fits within an existing cycle
          let thisEntryCycle = checkForMatchingCycle();

          // If it does, add that cycleId to the entry and create the entry
          if (thisEntryCycle) {
            addEntryToCycle(thisEntryCycle);

            // Else create older cycles until the new entry fits in one of them
          } else {
            let firstCycleStartDate = userTile.cycles[cycles.length-1].cycleStartDate;

            let earliestCycle = createNewCycle(firstCycleStartDate);
            addEntryToCycle(earliestCycle);
          }

          if (user.recentEntry) {
            if (user.recentEntry.entryDate > entry.entryDate) {
              user.recentEntry = entry;
            }
          } else {
            user.recentEntry = entry;
          }
          user.save();

          let program = await Program.findById(userTile.programId);
          if (program.recentEntry) {
            if (program.recentEntry.entryDate > entry.entryDate) {
              program.recentEntry = entry;
            }
          } else {
            program.recentEntry = entry;
          }
          program.save();

          res.status(200).send(userTile);
        } else {
          res.status(403).send('You do not have access to this tile');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // PUT /user/cycle/:cycleId/entry/:entryId
  update_entry: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { cycleId, entryId } = req.params;

    try {
      const entry = await Entry.findById(entryId);

      if (entry) {
        if (entry.userId == decoded.sub) {

          const currentCycle = await Cycle.findById(cycleId).populate('cycleEntries');
          const userTile = await UserTile.findById(entry.userTileId).populate('cycles');

          // Update entry
          entry.entryDate = props.entryDate;
          entry.activity = props.activity;
          entry.notes = props.notes;
          entry.minutes = props.minutes
          await entry.save();

          // Check if new entry date fits within the existing cycle
          function checkForMatchingCycle() {

            let thisEntryCycle = userTile.cycles.find(cycle => {
              let cycleStartDate = moment(cycle.cycleStartDate).startOf('day');
              let cycleEndDate = moment(cycle.cycleEndDate).startOf('day');

              if (moment(props.entryDate).isBetween(cycleStartDate, cycleEndDate, null, '[]')) {
                return cycle;
              } else {
                return null;
              }
            });
          }

          // Creates new cycles if needed
          // Function Start ---------------------------->>
          function createNewCycle(firstCycleStartDate) {

            if (moment(entry.entryDate).isSameOrAfter(firstCycleStartDate)) {

              // Stop creating cycles and return the earliest cycle
              return userTile.cycles[userTile.cycles.length - 1];
            } else {
              let cycleStartDate = moment(firstCycleStartDate).subtract((userTile.goalCycle + 1), 'days');

              let newCycle = new Cycle({
                adminId: userTile.adminId,
                userId: decoded.sub,
                tileId: userTile.tileId,
                cycleStartDate: cycleStartDate,
                cycleLengthInDays: userTile.goalCycle,
                cycleGoalInHours: userTile.goalHours,
                cycleTotalMinutes: 0
              });
              newCycle.save();

              // cycleEndDate and cycleNextDate will be created by Mongoose middleware (see cycle schema)
              // Add the cycle to the userTile
              userTile.cycles = [...userTile.cycles, newCycle];
              userTile.save();

              return createNewCycle(newCycle.cycleStartDate);
            };
          }
          // Function End ---------------------------->>

          function addEntryToCycle(cycle) {
            cycle.cycleTotalMinutes += entry.minutes;
            cycle.cycleEntries = [entry, ...cycle.cycleEntries];
            cycle.cycleEntries = cycle.cycleEntries.sort(function(a,b) {
              return b.entryDate == a.entryDate ? 0 : +(b.entryDate > a.entryDate) || -1;
            });

            // And remove from current cycle
            currentCycle.cycleEntries = currentCycle.cycleEntries.filter(cycleEntry => {
              return (entry._id.toString() !== cycleEntry._id.toString());
            })

            currentCycle.cycleTotalMinutes -= entry.minutes;

            currentCycle.save();
            cycle.save();
          }

          let thisEntryCycle = checkForMatchingCycle();

          if (thisEntryCycle) {
            addEntryToCycle(thisEntryCycle);

          } else {
            let firstCycleStartDate = userTile.cycles[userTile.cycles.length-1].cycleStartDate;
            let earliestCycle = createNewCycle(firstCycleStartDate);

            addEntryToCycle(earliestCycle);
          }

          res.status(200).send(userTile);
        } else {
          res.status(403).send('You do not have access to this tile');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // DELETE /user/cycle/:cycleId/entry/:entryId
  delete_entry: async(req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { cycleId, entryId } = req.params;

    try {

      const entry = await Entry.findById(entryId);
      const userTileId = entry.userTileId;

      if (entry) {
        if (entry.userId == decoded.sub) {
          const cycle = await Cycle.findById(cycleId);
          await Entry.findByIdAndRemove(entryId);
          cycle.cycleEntries.filter(cycleEntry => {
            return cycleEntry._id !== entryId
          });
          cycle.cycleTotalMinutes = cycle.cycleTotalMinutes -= entry.minutes;
          if (cycle.cycleTotalMinutes < 0) {
            cycle.cycleTotalMinutes = 0;
          }
          await cycle.save();

          const userTile = await UserTile.findById(userTileId)
            .populate({
              path: 'cycles',
              populate: {
                path: 'cycleEntries',
                model: 'entry'
              }
            });

          res.status(200).send(userTile);
        } else {
        res.status(403).send('You do not have access to this entry');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  }
  }
