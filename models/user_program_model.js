const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProgramSchema = new Schema({
  userId: String,
  adminId: String,
  programId: String,
  userProgramName: { type: String, lowercase: true },
  userName: { type: String, lowercase: true },
  created_date: { type: Date, default: Date.now }
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});

module.exports = mongoose.model('userProgram', userProgramSchema);
