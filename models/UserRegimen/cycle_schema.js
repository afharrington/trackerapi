const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const entrySchema = require('./entry_schema');

const cycleSchema = new Schema({
  cycleStartDate: { type: Date, default: Date.now },
  cycleTotalMinutes: Number,
  cycleEntries: [entrySchema]
});

module.exports = cycleSchema;

// FINISH THIS
cycleSchema.virtual('cycleTotalMinutes').get(function() {


})

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
