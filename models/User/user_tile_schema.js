const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const entrySchema = require('./entry_schema');

// TO DO: The color will be a calculated property based on Mongo data

const userTileSchema = new Schema({
  userTileName: String,
  // Tile (template) used to create this tile
  tile: {
    type: Schema.Types.ObjectId,
    ref: 'tile'
  },
  mode: String,
  continuousHours: Number,
  continuousDays: Number,
  goalHours: String,
  goalCycle: Number,
  totalMinutes: { type: Number, default: 0 },
  // color: { type: Number, default: 0 },
  currentCycleStart: { type: Date, default: Date.now },
  activity: String,
  entries: [entrySchema],
  created_date: { type: Date, default: Date.now },
});

// TileSchema.virtual('color').get(function() {
//   return COLOR CALCULATION HERE
// });

module.exports = userTileSchema;
