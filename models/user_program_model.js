const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userProgramSchema = new Schema({
  userId: String,
  adminId: String,
  programId: String,
  userProgramName: String,
  userName: String,
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
