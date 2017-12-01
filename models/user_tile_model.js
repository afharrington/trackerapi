const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userTileSchema = new Schema({
  adminId: String,
  userId: String,
  programId: String,
  tileId: String,
  userProgramId: String,
  userName: String,
  userTileName: String,
  goalHours: Number,
  goalCycle: Number,
  activityOptions: [],
  currentCycleStart: { type: Date, default: Date.now },
  cycles: [{
    type: Schema.Types.ObjectId,
    ref: 'cycle'
  }],
  created_date: { type: Date, default: Date.now },
},{
  toObject: {
    virtuals: true
  },
  toJSON: {
    virtuals: true
  }
});


// userProgramSchema.pre('save', function(next) {
//   const userTile = this;
//   const UserProgram = mongoose.model('userProgram');
//   UserProgram.findById({ _id: this.userId })
//     .then((user) => {
//       user.userProgram = null;
//       user.save()
//       .then(() => next());
//     })
//   });


module.exports = mongoose.model('userTile', userTileSchema);
