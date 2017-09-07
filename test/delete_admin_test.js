const assert = require('assert');
const Admin = require('../models/AdminModel');

describe('Deleting an admin', () => {
  let joe;

  beforeEach((done) => {
    joe = new Admin({ first_name: 'Joe' });
    joe.save()
      .then(() => done());
  });

  it('model instance: remove', (done) => {
    // Remove the record, when complete, search for an admin with name Joe,
    // test to make sure that that search returns null
    joe.remove()
      .then(() => Admin.findOne({ first_name: 'Joe'}))
      .then((admin) => {
        assert(admin === null);
        done();
      });
  });

  it('class method: remove', (done) => {
    // Remove multiple records with specific criteria
    Admin.remove({ first_name: 'Joe' })
      .then(() => Admin.findOne({ first_name: 'Joe'}))
      .then((admin) => {
        assert(admin === null);
        done();
      });
  });

  it('class method: findOneAndRemove', (done) => {
     Admin.findOneAndRemove({ first_name: 'Joe' })
      .then(() => Admin.findOne({ first_name: 'Joe'}))
      .then((admin) => {
        assert(admin === null);
        done();
    });
  });

  it('class method: findByIdAndRemove', (done) => {
    Admin.findByIdAndRemove(joe._id)
     .then(() => Admin.findOne({ first_name: 'Joe'}))
     .then((admin) => {
       assert(admin === null);
       done();
   });
 });

// Example with update operator inc - best for when updating many records at once
 // it('Increment post count by 1', (done) => {
 //   Admin.update({ name: 'Joe '}, { $inc: { postCount: -1 } })
 //    .then(() => Admin.findOne({ first_name: 'Joe' }))
 //    .then((admin) => {
 //      assert(admin.postCount == 1);
 //      done();
 //    })
 // });

});
