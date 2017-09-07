const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EntrySchema = new Schema({
  content: { type: String, required: true },
  comments: { type: String, default: '' },
  minutes: Number,
  date: Date
});

module.exports = EntrySchema;
