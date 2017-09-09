const assert = require('assert');
const Admin = require('../models/Admin/admin_model');

describe('Validating admin records', () => {

  beforeEach((done) => {
    james = new Admin({ firstName: 'james', email: 'james@gmail.com', password: 'password'})
    james.save()
      .then(() => done());
  });

  it('requires a first name', () => {
    const admin = new Admin({ firstName: undefined });
    const validationResult = admin.validateSync();
    const { message } = validationResult.errors.firstName;

    assert(message === "First name is required");
  });

  it('requires an email', () => {
    const admin = new Admin({ email: undefined });
    const validationResult = admin.validateSync();
    const { message } = validationResult.errors.email;

    assert(message === "Email is required");
  });

  // it.only('requires a unique email', () => {
  //   const bob = new Admin({ firstName: 'bob', email: 'bob@gmail.com', password: 'password' });
  //   console.log(bob);
  //
  //   const validationResult = bob.validateSync();
  //   const { message } = validationResult.errors.email;
  //
  //   console.log(message);
  // });
});
