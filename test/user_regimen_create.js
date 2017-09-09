const assert = require('assert');
const Regimen = require('../models/Regimen/regimen_model');
const UserRegimen = require('../models/User/user_regimen_schema');

describe('Creating UserRegimen from assigned Regimen', () => {

  beforeEach((done) => {
    jason = new User({ firsName: 'Jason' });
    regimen = new Regimen({ regimenName: 'Fitness' });

    jason.regimens.push(regimen);

    Promise.all([jason.save(), regimen.save()])
      .then(() => done());
  })



});
