const assert = require('assert');
const Admin = require('../models/AdminModel');

describe('Validating records', () => {
  it('requires a first name', () => {
    const admin = new Admin({ first_name: undefined });
    const validationResult = admin.validateSync();
    const { message } = validationResult.errors.first_name;

    assert(message === "First name is required");
  });
});
