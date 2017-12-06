const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  adminId: String,
  userId: String,
  cycleId: String,
  userName: { type: String, lowercase: true },
  userProgramId: String,
  userTileId: String,
  userTileName: String,
  tileId: String,
  activity: { type: String, lowercase: true },
  notes: { type: String, default: '' },
  minutes: Number,
  entryDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('entry', entrySchema);
