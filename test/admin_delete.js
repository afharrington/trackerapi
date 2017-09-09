const assert = require('assert');
const Admin = require('../models/Admin/admin_model');

describe('Deleting an admin', () => {
  let jane;

  beforeEach((done) => {
    jane = new Admin({ firstName: 'jane', email: 'jane@gmail.com', password: 'password' });

    jane.save()
      .then(() => done());
  });

  it('model instance: remove', (done) => {
    // Remove the record, when complete, search for an admin with name Jane,
    // test to make sure that that search returns null
    jane.remove()
      .then(() => Admin.findOne({ firstName: 'jane'}))
      .then((admin) => {
        assert(admin === null);
        done();
      });
  });

  it('class method: remove', (done) => {
    // Remove multiple records with specific criteria
    Admin.remove({ firstName: 'jane' })
      .then(() => Admin.findOne({ firstName: 'jane'}))
      .then((admin) => {
        assert(admin === null);
        done();
      });
  });

  it('class method: findOneAndRemove', (done) => {
     Admin.findOneAndRemove({ firstName: 'jane' })
      .then(() => Admin.findOne({ firstName: 'jane'}))
      .then((admin) => {
        assert(admin === null);
        done();
    });
  });

  it('class method: findByIdAndRemove', (done) => {
    Admin.findByIdAndRemove(jane._id)
     .then(() => Admin.findOne({ firstName: 'jane'}))
     .then((admin) => {
       assert(admin === null);
       done();
   });
 });
});
