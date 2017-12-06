const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const programSchema = new Schema({
  adminId: String,
  programName: { type: String, lowercase: true },
  created_date: { type: Date, default: Date.now },
  sport: { type: String, lowercase: true },
  recentEntry: {
    type: Schema.Types.ObjectId,
    ref: 'entry'
  },
});

module.exports = mongoose.model('program', programSchema);
