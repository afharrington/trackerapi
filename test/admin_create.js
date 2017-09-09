const assert = require('assert');
const Admin = require('../models/Admin/admin_model');

describe('Creating an admin account', () => {
  it('saves an admin', (done) => {
    const jane = new Admin({
      firstName: 'jane',
      email: 'jane@gmail.com',
      password: 'password'
    });
    jane.save() // save returns a promise
      .then(() => {
        assert(!jane.isNew); // successfully saved
        done();
      });
  });
});
