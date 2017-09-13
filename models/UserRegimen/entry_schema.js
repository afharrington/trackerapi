const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const entrySchema = new Schema({
  activity: String,
  comments: { type: String, default: '' },
  minutes: Number,
  date: Date
});

module.exports = entrySchema;
