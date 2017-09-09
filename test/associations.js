const assert = require('assert');
const Admin = require('../models/Admin/admin_model');
const User = require('../models/User/user_model');
const Regimen = require('../models/Regimen/regimen_model');

describe('Associations', () => {
  let jane, joe, regimen;

  beforeEach((done) => {
    jane = new Admin({ firstName: 'jane' , email: 'jane@gmail.com', password: 'password'});
    joe = new User ({ firstName: 'joe', email: 'joe@gmail.com', password: 'password' });
    regimen = new Regimen ({ regimenName: 'strength & fitness' });

    // Add Joe to the collection of users Jane manages
    jane.users.push(joe);
    // Add Jane as the admin for Joe's account
    joe.admin = jane;

    // Add regimen to Jane's list of regimens
    jane.regimens.push(regimen);
    // Add profile to Joe's list of assigned regimens
    joe.regimens.push(regimen);

    Promise.all([joe.save(), jane.save(), regimen.save()])
      .then(() => done());
  });

  it('saves relation between an admin and regimen', (done) => {
    Admin.findOne({ firstName: 'jane' })
      .populate('regimens')
      .then((admin) => {
        assert(admin.regimens[0].regimenName == 'strength & fitness');
        done();
      });
  });

  it('saves relation between an admin and user', (done) => {
    Admin.findOne({ firstName: 'jane' })
      .populate('users')
      .then((admin) => {
        assert(admin.users[0].firstName == 'joe');
        done();
      });
  });

  it('saves a relation between a user and admin', (done) => {
    User.findOne({ firstName: 'joe' })
      .populate('admin')
      .then((user) => {
        assert(user.admin.firstName == 'jane');
        done();
      });
  });

  it('saves a relation between a user and regimen', (done) => {
    User.findOne({ firstName: 'joe' })
      .populate('regimens')
      .then((user) => {
        assert(user.regimens[0].regimenName == 'strength & fitness');
        done();
      });
  });

  it('saves nested relations', (done) => {
    Admin.findOne({ firstName: 'jane' })
      .populate({
        path: 'users',
        populate: {
          path: 'regimens',
          model: 'regimen',
        }
      })
      .then((admin) => {
        assert(admin.firstName == 'jane');
        assert(admin.users[0].firstName == 'joe');
        assert(admin.users[0].regimens[0].regimenName == 'strength & fitness');
        done();
      })
  });
});
