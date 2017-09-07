const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PersonSchema = new Schema({
  name: String,
  adult: { type: Boolean, default: true }
});

module.exports = mongoose.model('Person', PersonSchema);
