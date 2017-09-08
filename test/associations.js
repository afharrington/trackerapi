const assert = require('assert');
const Admin = require('../models/Admin/admin_model');
const User = require('../models/User/user_model');
const Regimen = require('../models/Regimen/regimen_model');

describe('Associations', () => {
  let jane, joe, regimen;

  beforeEach((done) => {
    jane = new Admin({ first_name: 'Joe' });
    joe = new User ({ first_name: 'Jane' });
    regimen = new Regimen ({ regimen_name: 'Strength & Fitness' });

    // Add Joe to the collection of users Jane manages
    joe.users.push(jane);
    // Add Jane as the admin for Joe's account
    jane.admin = joe;

    // Add regimen to Joe's collection of profiles (he created)
    joe.regimens.push(regimen);
    // Add profile to Jane's collection of profiles (assigned to her)
    jane.regimens.push(regimen);

    Promise.all([joe.save(), jane.save(), regimen.save()])
      .then(() => done());
  });

  it('saves relation between an admin and regimen', (done) => {
    Admin.findOne({ first_name: 'Jane' })
      .populate('regimens')
      .then((admin) => {
        assert(admin.regimens[0].regimenName == 'Strength & Fitness');
        done();
      });
  });

  it('saves relation between an admin and user', (done) => {
    Admin.findOne({ firstName: 'Jane' })
      .populate('users')
      .then((admin) => {
        assert(admin.users[0].firstName == 'Joe');
        done();
      });
  });

  it('saves a relation between a player and admin', (done) => {
    User.findOne({ firstName: 'Joe' })
      .populate('admin')
      .then((user) => {
        assert(user.admin.firstName == 'Jane');
        done();
      });
  });

  it('saves a relation between a user and regimen', (done) => {
    User.findOne({ firstName: 'Joe' })
      .populate('regimens')
      .then((user) => {
        assert(user.regimens[0].regimenName == 'Strength & Fitness');
        done();
      });
  });

  it('saves nested relations', (done) => {
    Admin.findOne({ first_name: 'Jane' })
      .populate({
        path: 'users',
        populate: {
          path: 'regimens',
          model: 'regimen',
        }
      })
      .then((admin) => {
        assert(admin.firstName == 'Jane');
        assert(admin.users[0].firstName == 'Joe');
        assert(admin.users[0].regimens[0].regimenName == 'Strength & Fitness');
        done();
      })
  });
});
