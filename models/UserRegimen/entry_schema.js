const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  activity: String,
  comments: { type: String, default: '' },
  minutes: Number,
  created_date: { type: Date, default: Date.now }
});

module.exports = entrySchema;
