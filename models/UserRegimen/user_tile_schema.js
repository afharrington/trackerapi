const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const entrySchema = require('./entry_schema');
const cycleSchema = require('./cycle_schema');
const moment = require('moment');

const userTileSchema = new Schema({
  userTileName: String,
  fromTile: {
    type: Schema.Types.ObjectId,
    ref: 'tile'
  },
  goalHours: { type: Number, default: null },
  goalCycle: { type: Number, default: null },
  totalMinutesCycle: { type: Number, default: 0 },
  currentCycleStart: { type: Date, default: Date.now },
  activityOptions: [],
  // entries: [entrySchema],
  cycles: [cycleSchema],
  created_date: { type: Date, default: Date.now }
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

// Check how many days since the last cycle start
// If it hasn't been the length of a goal cycle yet


// userTileSchema.virtual('color').get(function() {
//   let color;
//   let currentTime = new Date();
//   let mostRecent;
//   if (this.entries.length !== 0) {
//     mostRecent = this.entries[0].created_date;
//   }
//
//   let current = moment(currentTime);
//   let recent = moment(mostRecent);
//   let daysSince = current.diff(recent, 'days');
//
//   let shadesPerHour = Math.floor(10 / 3);
//
//   if (daysSince > this.goalCycle) {
//     this.currentCycleStart == new Date();
//     this.totalMinutesCycle = 0;
//     return 0;
//   }
//
//   if (this.totalMinutesCycle == 0) {
//     color = 0;
//   } else {
//     color = shadesPerHour * this.totalMinutesCycle;
//   }
//
//
//
//   if (color < 0) {
//     return 0;
//   } else if (color > 9) {
//     return 9;
//   } else {
//     return color;
//   }
// });

module.exports = userTileSchema;
