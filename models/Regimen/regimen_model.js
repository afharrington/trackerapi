const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Regimens are created by Admins and assigned to Users
// Regimens contain references to Tiles

const regimenSchema = new Schema({
  regimenName: { type: String, lowercase: true },
  tiles: [{
    type: Schema.Types.ObjectId,
    ref: 'tile'
  }],
  created_date: { type: Date, default: Date.now },
});


module.exports = mongoose.model('regimen', regimenSchema);
