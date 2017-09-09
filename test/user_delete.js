const assert = require('assert');
const User = require('../models/User/user_model');
const Admin = require('../models/Admin/admin_model');

describe('Deleting user from database', () => {
  let jack, laura;

  beforeEach((done) => {
    jack = new Admin({ firstName: 'jack', email: 'jack@gmail.com', password: 'password' });
    laura = new User({ firstName: 'laura', email: 'laura@gmail.com', password: 'password' });

    laura.admin = jack;
    jack.users.push(laura);

    Promise.all([jack.save(), laura.save()])
      .then(() => done());
  });

  it('removes user from admin user list when deleted', (done) => {
    laura.remove()
      .then(() => Admin.findOne({ firstName: 'jack' }))
      .then((admin) => {
        assert(admin.users.length == 0);
        done();
      });
  });

  it('model instance: remove', (done) => {
    laura.remove()
      .then(() => User.findOne({ firstName: 'laura'}))
      .then((user) => {
        assert(user === null);
        done();
      });
  });

  it('class method: remove', (done) => {
    // Remove multiple records with specific criteria
    User.remove({ firstName: 'laura' })
      .then(() => User.findOne({ firstName: 'laura'}))
      .then((user) => {
        assert(user === null);
        done();
      });
  });

  it('class method: findOneAndRemove', (done) => {
     User.findOneAndRemove({ firstName: 'laura' })
      .then(() => User.findOne({ firstName: 'laura'}))
      .then((user) => {
        assert(user === null);
        done();
    });
  });

  it('class method: findByIdAndRemove', (done) => {
    User.findByIdAndRemove(laura._id)
     .then(() => User.findOne({ firstName: 'laura'}))
     .then((user) => {
       assert(user === null);
       done();
   });
 });
});
