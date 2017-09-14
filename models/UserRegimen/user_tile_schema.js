const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const entrySchema = require('./entry_schema');
const moment = require('moment');

const userTileSchema = new Schema({
  userTileName: String,
  fromTile: {
    type: Schema.Types.ObjectId,
    ref: 'tile'
  },
  mode: { type: String, default: "continuous" },
  continuousHours: { type: Number, default: 1 },
  continuousDays: { type: Number, default: 2 },
  goalHours: { type: Number, default: null },
  goalCycle: { type: Number, default: null },
  totalHoursLifetime: { type: Number, default: 0 },
  totalFadesLifetime: { type: Number, default: 0 }, // how many times color has degraded
  totalMinutesCycle: { type: Number, default: 0 },
  currentCycleStart: { type: Date, default: Date.now },
  activityOptions: [],
  entries: [entrySchema],
  created_date: { type: Date, default: Date.now },
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});


userTileSchema.virtual('color').get(function() {
  let color;
  let currentTime = new Date();
  let mostRecent;
  if (this.entries.length !== 0) {
    mostRecent = this.entries[0].created_date;
  }

  let current = moment(currentTime);
  let recent = moment(mostRecent);
  let daysSince = current.diff(recent, 'days');

  if (this.mode == 'goal') {
    let shadesPerHour = Math.floor(10 / 3);

    if (daysSince > this.goalCycle) {
      this.currentCycleStart == new Date();
      this.totalMinutesCycle = 0;
      return 0;
    }

    if (this.totalMinutesCycle == 0) {
      color = 0;
    } else {
      color = shadesPerHour * this.totalMinutesCycle;
    }

  } else if (this.mode = 'continuous') {
    if (daysSince >= this.continuousDays) {
      this.totalFadesLifetime += Math.floor(daysSince / continuousDays);
    }
    color = (this.continuousHours * this.totalHoursLifetime) - this.totalFadesLifetime;
  }

  if (color < 0) {
    return 0;
  } else if (color > 9) {
    return 9;
  } else {
    return color;
  }
});

module.exports = userTileSchema;
