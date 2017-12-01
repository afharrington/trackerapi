const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  adminId: String,
  userId: String,
  userName: String,
  userProgramId: String,
  userTileId: String,
  activity: String,
  notes: { type: String, default: '' },
  minutes: Number,
  entryDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('entry', entrySchema);
