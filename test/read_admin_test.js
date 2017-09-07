const assert = require('assert');
const Admin = require('../models/AdminModel');

describe('Reading admins out of the database', () => {
  let joe;

  // Inserts a record with name Joe in order to test below
  beforeEach((done) => { // make sure to include "done" to make sure save is complete
    joe = new Admin({ first_name: 'Joe', email: 'stuff@email.com' });
    joe.save()
      .then(() => done());
  });

  it('finds all admins with name Joe', (done) => {
    Admin.find({ first_name: 'Joe' })
      .then((admins) => {
        assert(admins[0]._id.toString() === joe._id.toString());
        done();
      });
  });

  it('finds an admin with a particular id', (done) => {
    Admin.findOne({ _id: joe._id })
      .then((admin) => {
        assert(admin.first_name === 'Joe');
        done();
      });
  });
});
