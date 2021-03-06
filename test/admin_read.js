const assert = require('assert');
const Admin = require('../models/Admin/admin_model');

describe('Reading admins out of the database', () => {
  let jane;

  beforeEach((done) => {
    jane = new Admin({ firstName: 'jane', email: 'jane@gmail.com', password: 'password' })
    jane.save()
      .then(() => done());
  });

  it('finds all admins with name Jane', (done) => {
    Admin.find({ firstName: 'jane' })
      .then((admins) => {
        assert(admins[0]._id.toString() === jane._id.toString());
        done();
      });
  });

  it('finds an admin with a particular id', (done) => {
    Admin.findOne({ _id: jane._id })
      .then((admin) => {
        assert(admin.firstName === 'jane');
        done();
      });
  });
});
