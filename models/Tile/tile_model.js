const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Tiles are created by Admins and contain default settings to
// be applied to UserTiles

const tileSchema = new Schema({
  tileName: { type: String },
  mode: { type: String, required: true, default: "continuous" },
  continuousHours: { type: Number, default: 1 },
  continuousDays: { type: Number, default: 2 },
  goalHours: { type: Number, default: null },
  goalCycle: { type: String, default: null },
  activityOptions: [],
  created_date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('tile', tileSchema);
