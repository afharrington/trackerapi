const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tileSchema = new Schema({
  tileName: String,
  programId: String,
  goalHours: { type: Number, default: null },
  goalCycle: { type: Number, default: null },
  activityOptions: [],
  adminId: String,
  created_date: { type: Date, default: Date.now },
});



module.exports = mongoose.model('tile', tileSchema);
