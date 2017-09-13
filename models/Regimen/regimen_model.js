const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const tileSchema = require('./tile_schema');

const regimenSchema = new Schema({
  regimenName: { type: String, lowercase: true },
  adminId: String,
  tiles: [tileSchema],
  created_date: { type: Date, default: Date.now },
});

regimenSchema.pre('remove', function(next) {
  const regimenToRemove = this;
  const Admin = mongoose.model('admin');
  Admin.findById({ _id: this.adminId })
    .then((admin) => {
      admin.regimens = admin.regimens.filter(regimen => regimen == regimenToRemove);
      admin.save()
      .then(() => next());
    })
  });

module.exports = mongoose.model('regimen', regimenSchema);
