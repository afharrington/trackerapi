const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tileSchema = new Schema({
  tileName: String,
  mode: String,
  continuousHours: Number,
  continuousDays: Number,
  goalHours: String,
  goalCycle: Number,
  activityOptions: [],
  created_date: { type: Date, default: Date.now },
});


module.exports = tileSchema;
