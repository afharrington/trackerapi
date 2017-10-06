const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const entrySchema = require('./entry_schema');
const cycleSchema = require('./cycle_schema');
const moment = require('moment');

const userTileSchema = new Schema({
  userTileName: String,
  userName: String,
  fromTile: {
    type: Schema.Types.ObjectId,
    ref: 'tile'
  },
  goalHours: { type: Number, default: null },
  goalCycle: { type: Number, default: null },
  currentCycleStart: { type: Date, default: Date.now },
  activityOptions: [],
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


module.exports = userTileSchema;
