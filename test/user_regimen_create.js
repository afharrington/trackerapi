const assert = require('assert');
const Program = require('../models/Program/program_model');
const UserProgram = require('../models/User/user_program_schema');

describe('Creating UserProgram from assigned Program', () => {

  beforeEach((done) => {
    jason = new User({ firsName: 'Jason' });
    program = new Program({ programName: 'Fitness' });

    jason.programs.push(program);

    Promise.all([jason.save(), program.save()])
      .then(() => done());
  })



});
