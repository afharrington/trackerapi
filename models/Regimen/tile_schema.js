const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tileSchema = new Schema({
  tileName: String,
  mode: { type: String, default: "continuous" },
  continuousHours: { type: Number, default: 1 },
  continuousDays: { type: Number, default: 2 },
  goalHours: { type: Number, default: null },
  goalCycle: { type: Number, default: null },
  activityOptions: [],
  created_date: { type: Date, default: Date.now },
});


module.exports = tileSchema;
