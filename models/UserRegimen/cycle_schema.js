const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const entrySchema = require('./entry_schema');
const moment = require('moment');

const cycleSchema = new Schema({
  cycleStartDate: { type: Date, default: Date.now },
  cycleEndDate: { type: Date },
  cycleEntries: [entrySchema],
  cycleTotalMinutes: Number,
  cycleLengthInDays: Number,
  cycleGoalInHours: Number,
  color: Number
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

module.exports = cycleSchema;

// Calculates total minutes and color value
cycleSchema.pre('save', function(next) {

  const NUM_SHADES = 10;
  const shadesPerHour = Math.floor(NUM_SHADES / this.cycleGoalInHours);
  let color;


  if (this.cycleEntries.length !== 0) {
    let totalMinutes = this.cycleEntries.reduce(function(prev, curr) {
      return prev + curr['minutes'];
    }, 0);
    this.cycleTotalMinutes = totalMinutes;
    let totalHours = totalMinutes / 60;
    if (totalHours == 0) {
      color = 0;
    } else {
      color = shadesPerHour * totalHours;
    }
    if (color > 9) {
      this.color = 9;
    } else {
      this.color = color;
    }

    this.cycleEntries = this.cycleEntries.sort(function(a,b){return b.entryDate - a.entryDate});
    this.cycleEndDate = moment(this.cycleStartDate).add(this.cycleLengthInDays, 'days');
  }
  next();
});


cycleSchema.virtual('cyclePercent').get(function() {
  let goalInMinutes = this.cycleGoalInHours * 60;
  let percent = Math.floor((this.cycleTotalMinutes / goalInMinutes) * 100);
  if (percent > 100) {
    return 100;
  } else {
    return percent;
  }
})


cycleSchema.virtual('cycleNextDate').get(function() {
  let nextDate = moment(this.cycleStartDate).add(this.cycleLengthInDays + 1, 'days');
  return nextDate;
})
