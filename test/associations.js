const assert = require('assert');
const Admin = require('../models/Admin/admin_model');
const User = require('../models/User/user_model');
const Program = require('../models/Program/program_model');

describe('Associations', () => {
  let jane, joe, program;

  beforeEach((done) => {
    jane = new Admin({ firstName: 'jane' , email: 'jane@gmail.com', password: 'password'});
    joe = new User ({ firstName: 'joe', email: 'joe@gmail.com', password: 'password' });
    program = new Program ({ programName: 'strength & fitness' });

    // Add Joe to the collection of users Jane manages
    jane.users.push(joe);
    // Add Jane as the admin for Joe's account
    joe.admin = jane;

    // Add program to Jane's list of programs
    jane.programs.push(program);
    // Add profile to Joe's list of assigned programs
    joe.programs.push(program);

    Promise.all([joe.save(), jane.save(), program.save()])
      .then(() => done());
  });

  it('saves relation between an admin and program', (done) => {
    Admin.findOne({ firstName: 'jane' })
      .populate('programs')
      .then((admin) => {
        assert(admin.programs[0].programName == 'strength & fitness');
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

  it('saves a relation between a user and program', (done) => {
    User.findOne({ firstName: 'joe' })
      .populate('programs')
      .then((user) => {
        assert(user.programs[0].programName == 'strength & fitness');
        done();
      });
  });

  it('saves nested relations', (done) => {
    Admin.findOne({ firstName: 'jane' })
      .populate({
        path: 'users',
        populate: {
          path: 'programs',
          model: 'program',
        }
      })
      .then((admin) => {
        assert(admin.firstName == 'jane');
        assert(admin.users[0].firstName == 'joe');
        assert(admin.users[0].programs[0].programName == 'strength & fitness');
        done();
      })
  });
});
