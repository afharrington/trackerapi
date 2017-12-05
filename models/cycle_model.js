const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const moment = require('moment');

const cycleSchema = new Schema({
  adminId: String,
  userId: String,
  tileId: String, // TILE, not userTile!
  // Decide if userTileId and userProgramId should be here, too
  cycleStartDate: { type: Date, default: Date.now },
  cycleEndDate: { type: Date }, // Automatically updated on save
  cycleNextDate: { type: Date }, // Automatically updated on save
  cycleTotalMinutes: Number, // Automatically updated on save
  cycleLengthInDays: Number, // From tile settings
  cycleGoalInHours: Number, // From tile settings
  cycleEntries: [{
    type: Schema.Types.ObjectId,
    ref: 'entry'
  }],
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

// Note that right now, if the tile settings or user settings change, old cycles will NOT be updated right now

// Creates additional calculated variables when saving a new cycle
cycleSchema.pre('save', function(next) {
  // If there are entries, total the minutes, and keep array of entries sorted by date
  if (this.cycleEntries.length !== 0) {
    // let totalMinutes = this.cycleEntries.reduce(function(prev, curr) {
    //   return prev + curr['minutes'];
    // }, 0);
    // this.cycleTotalMinutes = totalMinutes;
    this.cycleEntries = this.cycleEntries.sort(function(a,b){return b.entryDate - a.entryDate});
  } else {
    this.cycleTotalMinutes = 0;
  }
  // Calculate the cycle's end date and the start date of the next cycle
  this.cycleEndDate = moment(this.cycleStartDate).add(this.cycleLengthInDays, 'days');
  this.cycleNextDate = moment(this.cycleStartDate).add((this.cycleLengthInDays + 1), 'days');
  next();
});

// Calculate % of cycle completed
cycleSchema.virtual('cyclePercent').get(function() {
  let goalInMinutes = this.cycleGoalInHours * 60;
  let percent = Math.floor((this.cycleTotalMinutes / goalInMinutes) * 100);
  if (percent > 100) {
    return 100;
  } else {
    return percent;
  }
});

module.exports = mongoose.model('cycle', cycleSchema);
