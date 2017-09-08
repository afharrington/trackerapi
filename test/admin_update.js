const assert = require('assert');
const Admin = require('../models/Admin/admin_model');

describe('Updating records', () => {
  let jane;

  beforeEach((done) => {
    jane = new Admin({ firstName: 'Jane' });
    jane.save()
      .then(() => done());
  });

  // Helper function for below - takes an operation, searches all
  // admins, and tests for change to firstName property
  function assertName(operation, done) {
    operation
    .then(() => Admin.find({}))
    .then((admins) => {
      assert(admins.length === 1);
      assert(admins[0].firstName === 'Janet');
      done();
    });
  }

  // Use for incremental updates over time
  it('model instance updates with set and save method', (done) => {
    jane.set('first_name', 'Janet');
    assertName(jane.save(), done);
  });

  // Use for bulk / instantaneous updates
  it('model instance updates with update method', (done) => {
    assertName(jane.update({firstName: 'Janet'}), done);
  });

  // Update all records matching criteria
  it('model class updates multiple matching records', (done) => {
      assertName(
        Admin.update({ firstName: 'Jane' }, { firstName: 'Janet' }),
        done
      );
  });

  // Update a specific record matching criteria
  it('model class updates a single record', (done) => {
      assertName(
        Admin.findOneAndUpdate({ firstName: 'Jane' }, { firstName: 'Janet' }),
        done
      );
  });

  // Update a specific record matching id
  it('model class finds a record by id and updates', (done) => {
      assertName(
        Admin.findByIdAndUpdate(jane._id, { firstName: 'Janet' }),
        done
      );
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
