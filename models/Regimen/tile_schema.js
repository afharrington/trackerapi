const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tileSchema = new Schema({
  tileName: String,
  goalHours: { type: Number, default: null },
  goalCycle: { type: Number, default: null },
  activityOptions: [],
  created_date: { type: Date, default: Date.now },
});


module.exports = tileSchema;
