const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  activity: String,
  notes: { type: String, default: '' },
  minutes: Number,
  entryDate: { type: Date, default: Date.now }
});

module.exports = entrySchema;
