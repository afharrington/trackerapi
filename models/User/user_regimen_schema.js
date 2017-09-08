const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userTileSchema = require('./user_tile_schema');

// * User-specific set of tiles corresponding with the tiles belonging to
//   the assigned regimen

const userRegimenSchema = new Schema({
  userRegimenName: { type: String, lowercase: true },
  userTiles: [userTileSchema],
  created_date: { type: Date, default: Date.now },
});

module.exports = userRegimenSchema;
