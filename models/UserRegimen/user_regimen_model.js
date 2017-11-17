const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const userTileSchema = require('./user_tile_schema');

const userRegimenSchema = new Schema({
  userId: String,
  userName: String,
  userRegimenName: { type: String, lowercase: true },
  fromRegimenId: String,
  fromRegimen: {
    type: Schema.Types.ObjectId,
    ref: 'regimen'
  },
  userTiles: [userTileSchema],
  created_date: { type: Date, default: Date.now },
});

// Before deleting a userRegimen instance, also remove the
// reference from the user's account
userRegimenSchema.pre('remove', function(next) {
  const userRegimenToRemove = this;
  const User = mongoose.model('user');
  User.findById({ _id: this.userId })
    .then((user) => {
      user.userRegimen = null;
      user.save()
      .then(() => next());
    })
  });

module.exports = mongoose.model('userRegimen', userRegimenSchema);
