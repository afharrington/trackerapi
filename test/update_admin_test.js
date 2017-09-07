const assert = require('assert');
const Admin = require('../models/AdminModel');

describe('Updating records', () => {
  let joe;

  beforeEach((done) => {
    joe = new Admin({ first_name: 'Joe' });
    joe.save()
      .then(() => done());
  });

  // takes a promise and makes assertions
  function assertName(operation, done) {
    operation
    .then(() => Admin.find({}))
    .then((admins) => {
      assert(admins.length === 1);
      assert(admins[0].first_name === 'Alex');
      done();
    });
  }

  // good for incremental updates over time
  it('model instance updates with set and save method', (done) => {
    joe.set('first_name', 'Alex');
    assertName(joe.save(), done); // hands off promise to assertName function
  });

  // good for bulk instantaneous updates
  it('model instance updates with update method', (done) => {
    assertName(joe.update({first_name: 'Alex'}), done);
  });

  // updates all records matching criteria
  it('model class updates multiple matching records', (done) => {
      assertName(
        Admin.update({ first_name: 'Joe' }, { first_name: 'Alex' }),
        done
      );
  });

  // updates a specific record matching criteria
  it('model class updates a single record', (done) => {
      assertName(
        Admin.findOneAndUpdate({ first_name: 'Joe' }, { first_name: 'Alex' }),
        done
      );
  });

  // updates a specific record matching id
  it('model class finds a record by id and updates', (done) => {
      assertName(
        Admin.findByIdAndUpdate(joe._id, { first_name: 'Alex' }),
        done
      );
  });
});
