const mongoose = require("mongoose");
const jwt = require('jwt-simple');
const config = require('../config/keys.js');
const moment = require('moment');
const ExtractJwt = require('passport-jwt').ExtractJwt;
const _ = require('lodash');

// Mongoose models and schemas
const Admin = require('../models/admin_model');
const User = require('../models/user_model');
const Program = require('../models/program_model');
const Tile = require('../models/tile_model');
const UserProgram = require('../models/user_program_model');
const UserTile = require('../models/user_tile_model');
const Cycle = require('../models/cycle_model');
const Entry = require('../models/entry_model');

// MANAGING USER ACCOUNTS ==================================================>>

module.exports = {

  // Get recent entries from users managed by this admin
  // GET /admin/recent
  get_recent_entries: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let recentEntries = await Entry.find({ adminId: decoded.sub }).sort({entryDate: -1}).limit(100);

      res.status(200).send(recentEntries);
    } catch(err) {
      console.log(err);
      next(err);
    }
  },

  // Get all users managed by this admin
  // GET /admin/user
  get_users: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let users = await User.find({ adminId: decoded.sub }).populate('activeUserProgram');
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

    try {
      let existingUser = await User.findOne({ email: props.email });
      if (existingUser) {
        res.send('This email is already registered for a user account');
      } else {
        // Create a new user (without password)
        let user = await User.create({
          adminId: decoded.sub,
          firstName: props.firstName,
          lastName: props.lastName,
          email: props.email,
          code: props.code,
          sport: props.sport,
        });

        let userName = `${user.firstName} ${user.lastName}`;
        let tiles = await Tile.find({ programId: props.program });

        // Create userTiles to go in userProgram
        let program = await Program.findById(props.program);

        // Create a new user program
        let userProgram = await UserProgram.create({
          adminId: decoded.sub,
          userId: user._id,
          userName: userName,
          programId: props.program,
          userProgramName: program.programName,
        });

        if (tiles) {
          for (let tile of tiles) {

            // Create a new userTile that matches the programTile
            let cycle = await Cycle.create({
              adminId: decoded.sub,
              userId: user._id,
              userName: userName,
              tileId: tile._id,
              cycleStartDate: new Date(),
              cycleLengthInDays: tile.goalCycle,
              cycleGoalInHours: tile.goalHours,
              cycleTotalMinutes: 0
            });

            let userTile = new UserTile({
              adminId: decoded.sub,
              userId: user._id,
              userName: userName,
              programId: program._id,
              tileId: tile._id,
              userProgramId: userProgram._id,
              userTileName: tile.tileName,
              goalHours: tile.goalHours,
              goalCycle: tile.goalCycle,
              activityOptions: tile.activityOptions,
              currentCycleStart: new Date(),
              cycles: [cycle]
            });
            userTile.save();

          }
        }

        user.activeUserProgram = userProgram;
        await user.save();
        res.status(200).send(user);
        }
      } catch(err) {
        console.log(err);
        next(err);
    }
  },

  // GET /admin/user/:userId
  get_user: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { userId } = req.params;

    try {
      let user = await User.findById(userId).populate('activeUserProgram');
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
      const user = await User.findById(userId).populate('activeUserProgram');

      if (user) {
        if (user.adminId == decoded.sub) {

          user.adminId = user.adminId;
          user.firstName = props.firstName || user.firstName;
          user.lastName = props.lastName || user.lastName;
          user.email = props.email || user.email;
          user.sport = props.sport ||  user.sport;
          user.code = props.code || user.code;

          // If the program selected does not match the current active program
          if (props.program != user.activeUserProgram.programId) {

            // Look for an existing program that matches the id in the request
            let existingUserProgram = await UserProgram.findOne({ userId: user._id, programId: props.program });

            // If the program exists, set it to be the active one
            if (existingUserProgram) {
              user.activeUserProgram = existingUserProgram;

            // Else create a new user program and set it as active
            } else {

              // Create userTiles to go in userProgram
              let program = await Program.findById(props.program);
              let tiles = await Tile.find({ programId: program._id });

              let userName = `${user.firstName} ${user.lastName}`;
              // Create a new user program
              let userProgram = await UserProgram.create({
                adminId: decoded.sub,
                userId: user._id,
                userName: userName,
                programId: props.program,
                userProgramName: program.programName,
              });

              if (tiles) {
                for (let tile of tiles) {

                  // Create a new userTile that matches the programTile
                  let cycle = await Cycle.create({
                    adminId: decoded.sub,
                    userId: user._id,
                    userName: userName,
                    tileId: tile._id,
                    cycleStartDate: new Date(),
                    cycleLengthInDays: tile.goalCycle,
                    cycleGoalInHours: tile.goalHours,
                    cycleTotalMinutes: 0
                  });

                  let userTile = new UserTile({
                    adminId: decoded.sub,
                    userId: user._id,
                    userName: userName,
                    programId: program._id,
                    tileId: tile._id,
                    userProgramId: userProgram._id,
                    userTileName: tile.tileName,
                    goalHours: tile.goalHours,
                    goalCycle: tile.goalCycle,
                    activityOptions: tile.activityOptions,
                    currentCycleStart: new Date(),
                    cycles: [cycle]
                  });
                  userTile.save();

                }
              }

              user.activeUserProgram = userProgram;
            }

            let updatedUser = await user.save();
            res.status(200).send(updatedUser);
          }

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
      const user = await User.findById(userId).populate('activeUserProgram');

      if (user) {
        if (user.adminId == decoded.sub) {

          await UserProgram.deleteMany({ userId: userId });
          await UserTile.deleteMany({ userId: userId });
          await Cycle.deleteMany({ userId: userId });
          await Entry.deleteMany({ userId: userId });

          // Delete user
          await User.findByIdAndRemove(userId);

          res.status(200).send(userId);
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


// MANAGING PROGRAMS =======================================================>>

  // Get all programs associated with this admin
  // GET /admin/programs
  get_programs: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);

    try {
      let programs = await Program.find({ adminId: decoded.sub }).populate('tiles');
      res.status(200).send(programs);
    } catch(err) {
      next(err);
    }
  },

  // POST /admin/program
  create_program: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    props.adminId = decoded.sub;

    try {
      let program = await Program.create(props);
      res.status(200).send(program);
    } catch(err) {
      next(err);
    }
  },

  // Get a specific program
  // GET /admin/program/:programId
  get_program: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { programId } = req.params;

    try {
      let program = await Program.findById(programId);
      if (program) {
        if (program.adminId === decoded.sub) {
          res.status(200).send(program);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // GET /admin/program/:programId/tiles
  get_program_tiles: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { programId } = req.params;

    try {
      let program  = await Program.findById(programId);

      if (program) {
        if (program.adminId === decoded.sub) {
          let tiles = await Tile.find({ programId: programId });
          res.status(200).send(tiles);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Get user tiles from this tile
  // GET /admin/tile/:tileId/usertiles
  get_tile_user_tiles: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { tileId } = req.params;

    try {
      let tile  = await Tile.findById(tileId);

      if (tile) {
        if (tile.adminId === decoded.sub) {
          let userTiles = await UserTile.find({ tileId: tileId }).populate('cycles');
          res.status(200).send(userTiles);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Get user tiles from this program
  // GET /admin/program/:programId/usertiles
  get_program_user_tiles: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { programId } = req.params;

    try {
      let program  = await Program.findById(programId);

      if (program) {
        if (program.adminId === decoded.sub) {
          let userTiles = await UserTile.find({ programId: programId });
          res.status(200).send(userTiles);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Update program (used in the app to update the program's name)
  // PUT /admin/program/:programId
  update_program: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { programId } = req.params;
    const props = req.body;

    try {
      const program = await Program.findById(programId);
      if (program) {
        if (program.adminId == decoded.sub) {
          let updatedProgram = await Program.findByIdAndUpdate(programId, props, {new: true});

          // Also updates user programs that are based on this program
          let userPrograms = await UserProgram.find({ programId: programId});
          userPrograms.forEach(userProgram => {
            userProgram.userProgramName = props.programName;
            userProgram.save();
          })
          res.status(200).send(updatedProgram);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // DELETE /admin/program/:programId
  delete_program: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { programId } = req.params;
    const props = req.body;

    try {
      const program = await Program.findById(programId);
      if (program) {
        if (program.adminId == decoded.sub) {
          await Program.findByIdAndRemove(programId);
          await UserProgram.deleteMany({ programId: programId });
          await UserTile.deleteMany({ programId: programId });
          await Cycle.deleteMany({ programId: programId });
          await Entry.deleteMany({ programId: programId });ß
          res.status(200).send(programId);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },


// MANAGING TILES ===========================================================>>

  // POST /admin/program/:programId
  create_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { programId } = req.params;
    const props = req.body;
    props.programId = programId;
    props.adminId = decoded.sub;

    try {
      const program = await Program.findById(programId).populate('tiles');

      if (program) {
        if (program.adminId == decoded.sub) {

          let tile = await Tile.create(props);

          // Add a new userTile to any userPrograms matching this program
          let userPrograms = await UserProgram.find({ programId: program._id });

          if (userPrograms) {
            for (let userProgram of userPrograms) {

              let userName = userProgram.userName;

              let cycle = await Cycle.create({
                adminId: decoded.sub,
                userId: user._id,
                userName: userName,
                tileId: tile._id,
                cycleStartDate: new Date(),
                cycleLengthInDays: tile.goalCycle,
                cycleGoalInHours: tile.goalHours,
                cycleTotalMinutes: 0
              });

              let userTile = new UserTile({
                adminId: decoded.sub,
                userId: user._id,
                userName: userName,
                programId: program._id,
                tileId: tile._id,
                userProgramId: userProgram._id,
                userTileName: tile.tileName,
                goalHours: tile.goalHours,
                goalCycle: tile.goalCycle,
                activityOptions: tile.activityOptions,
                currentCycleStart: new Date(),
                cycles: [cycle]
              });

              userTile.save();
            }
          }

          res.status(200).send(tile);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },



  // PUT /admin/tile/:tileId
  update_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { tileId } = req.params;
    const { tileName, activityOptions, goalHours, goalCycle } = req.body;

    try {
      const tile = await Tile.findById(tileId);

      if (tile) {
        if (tile.adminId == decoded.sub) {
          tile.tileName = tileName || tile.tileName;
          tile.activityOptions = activityOptions || tile.activityOptions;
          tile.goalHours = goalHours || tile.goalHours;
          tile.goalCycle = goalCycle || tile.goalCycle;

          let updatedTile = await tile.save({new: true});
          let userTiles = await UserTile.find({ tildId: tileId });

          if (userTiles) {
            for (let userTile of userTiles) {

              let cycle = await Cycle.create({
                adminId: decoded.sub,
                userId: user._id,
                userName: updatedTile.userName,
                tileId: updatedTile._id,
                cycleStartDate: new Date(),
                cycleLengthInDays: updatedTile.goalCycle,
                cycleGoalInHours: updatedTile.goalHours,
                cycleTotalMinutes: 0
              });

              userTile.userTileName = updatedTile.tileName;
              userTile.activityOptions = updatedTile.activityOptions;
              userTile.goalHours = updatedTile.goalHours;
              userTile.goalCycle = updatedTile.goalCycle;
              userTile.currentCycleStart = new Date();
              userTile.cycles = [cycle, ...userTile.cycles];
              userTile.save();
            }
          }

          res.status(200).send(updatedTile);
        } else {
          res.status(403).send('You do not have administrative access to this tile');
        }
      } else {
        res.status(422).send({ error: 'Tile not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // DELETE /admin/tile/:tileId
  delete_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { tileId } = req.params;

    try {
      const tile = await Tile.findById(tileId);

      if (tile) {
        if (tile.adminId == decoded.sub) {
          const programId = tile.programId;
          await Tile.findByIdAndRemove(tileId);
          UserTile.deleteMany({ tileId: tileId });
          const tiles = await Tile.find({ programId: programId });
          res.status(200).send(tiles);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Tile not found'});
      }
    } catch(err) {
      next(err);
    }
  },


// MANAGING SPECIFIC USER TILES AND REGIMENS =================================================>>

  // GET /admin/user/program/:userProgramId
  get_user_program: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { userProgramId } = req.params;

    try {
      let userProgram = UserProgram.findById(userProgramId);

      if (userProgram) {
        if (userProgram.adminId === decoded.sub) {
          res.status(200).send(userProgram);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Gets all userPrograms belonging to this user
  // GET /admin/user/:userId/programs
  get_this_user_programs: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { userId } = req.params;
    const props = req.body;

    try {
      let user = await User.findById(userId);
      if (user) {
        if (user.adminId == decoded.sub) {
          const userPrograms = await UserProgram.find({ userId: userId });
          res.status(200).send(userPrograms);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Get all of the userPrograms that were created with this program
  // GET /admin/program/:programId/users
  get_user_programs: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { programId } = req.params;
    const props = req.body;

    try {
      let program = await Program.findById({ _id: req.params.programId });
      if (program) {
        if (program.adminId == decoded.sub) {
          const userPrograms = await UserProgram.find({ programId: programId});
          res.status(200).send(userPrograms);
        } else {
          res.status(403).send('You do not have administrative access to this program');
        }
      } else {
        res.status(422).send({ error: 'Program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Get tiles from this user program
  // GET /admin/user/program/:userProgramId/tiles
  get_user_program_tiles: async(req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { userProgramId } = req.params;

    try {
      const userProgram = await UserProgram.findById(userProgramId);

      if (userProgram) {
        if (userProgram.adminId == decoded.sub) {
          const userTiles = await UserTile.find({ userProgramId: userProgramId }).populate('cycles');
          res.status(200).send(userTiles);
        } else {
          res.status(403).send('You do not have administrative access to this user');
        }
      } else {
        res.status(422).send({ error: 'User program not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // GET /admin/user/tile/:userTileId
  get_user_tile: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { userTileId } = req.params;

    try {
      const userTile = await UserTile.findById(userTileId)
      .populate({
        path: 'cycles',
        populate: {
          path: 'cycleEntries',
          model: 'entry'
        }
      });

      if (userTile) {
        if (userTile.adminId == decoded.sub) {
          res.status(200).send(userTile);
        } else {
          res.status(403).send('You do not have administrative access to this user');
        }
      } else {
        res.status(422).send({ error: 'User tile not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // Gets all user tiles matching a single tile
  // GET /admin/tile/:tileId/users
  get_user_tiles: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { tileId } = req.params;
    const props = req.body;

    try {
      let tile = await Tile.findById(tileId);
      if (tile) {
        if (tile.adminId == decoded.sub) {
          let userTiles = await UserTile.find({ tileId: tileId});
          res.status(200).send(userTiles);
        } else {
          res.status(403).send('You do not have administrative access to this tile');
        }
      } else {
        res.status(422).send({ error: 'Tile not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // POST /admin/user/tile/:userTileId
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
        // Check if admin has administrative access to this user tile
        if (userTile.adminId == decoded.sub) {
          let cycles = userTile.cycles;

          let entry = await Entry.create({
            adminId: decoded.sub,
            userId: userTile.userId,
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
                adminId: decoded.sub,
                userId: userTile.userId,
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

          res.status(200).send(userTile);
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

  // PUT /admin/user/cycle/:cycleId/entry/:entryId
  update_entry: async (req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const props = req.body;
    const { cycleId, entryId } = req.params;

    try {
      const entry = await Entry.findById(entryId);

      if (entry) {
        if (entry.adminId == decoded.sub) {

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
                adminId: decoded.sub,
                userId: userTile.userId,
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
          res.status(403).send('You do not have administrative access to this user');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  },

  // DELETE /admin/user/cycle/:cycleId/entry/:entryId
  delete_entry: async(req, res, next) => {
    const header = req.headers.authorization.slice(4);
    const decoded = jwt.decode(header, config.secret);
    const { cycleId, entryId } = req.params;

    try {
      const entry = await Entry.findById(entryId);
      if (entry) {
        if (entry.adminId == decoded.sub) {
          const cycle = await Cycle.findById(cycleId);
          await Entry.findByIdAndRemove(entryId);
          cycle.cycleEntries.filter(cycleEntry => {
            return cycleEntry._id !== entryId
          });
          cycle.cycleTotalMinutes = cycle.cycleTotalMinutes -= entry.minutes;
          await cycle.save();
          res.status(200).send(entryId);
        } else {
        res.status(403).send('You do not have administrative access to this user');
        }
      } else {
        res.status(422).send({ error: 'User not found'});
      }
    } catch(err) {
      next(err);
    }
  }
}
