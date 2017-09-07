const assert = require('assert');
const Admin = require('../models/AdminModel');

describe('Creating an admin account', () => {
  it('saves an admin', (done) => {
    const joe = new Admin({
      first_name: 'Joe',
      email: 'joe2@gmail.com',
      password: 'password'
    });
    joe.save() // save returns a promise
      .then(() => {
        assert(!joe.isNew); // successfully saved
        done();
      });
  });
});
