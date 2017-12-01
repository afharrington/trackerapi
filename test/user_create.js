const assert = require('assert');
const User = require('../models/User/user_model');
const Program = require('../models/Program/program_model');
const Tile = require('../models/Tile/tile_model');

describe('Creating a user', () => {
  let fitness;

  beforeEach((done) => {
    fitness = new Program({
      programName: 'strength & fitness',
      tiles: [{
        tileName: 'hypertrophy',
        mode: 'goal'
      },{
        tileName: 'mobility',
        mode: 'goal'
      }]
    });

    brainHealth = new Program({ programName: 'brain health' });

    Promise.all([fitness.save(), brainHealth.save()])
      .then(() => done());
  });


  it('saves a user', (done) => {

    const joe = new User({
      firstName: 'joe',
      lastName: 'howard',
      email: 'joe@gmail.com',
      password: 'password',
      mobile: '555-555-5555',
      sport: 'basketball',
      programs: [fitness],
      userPrograms: []
    });

    joe.programs.forEach(program => {
        let userProgram = {
          userProgramName: program.programName,
          userTiles: []
        };
        if(program.tiles) {
          program.tiles.forEach(tile => {
            let userTile = {
              userTileName: tile.tileName,
              mode: tile.mode,
              continuousHours: tile.continuousHours,
              continuousDays: tile.continuousDays,
              goalHours: tile.goalHours,
              activityOptions: tile.activityOptions
            }
            userProgram.userTiles.push(userTile);
          });
          joe.userPrograms.push(userProgram);
        }
    });

    joe.save()
      .then(() => {
        assert(!joe.isNew);
        done();
      });
  });

});
