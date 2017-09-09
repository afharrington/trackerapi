const assert = require('assert');
const User = require('../models/User/user_model');
const Regimen = require('../models/Regimen/regimen_model');
const Tile = require('../models/Tile/tile_model');

describe('Creating a user', () => {
  let regimen;

  beforeEach((done) => {
    fitness = new Regimen({ regimenName: 'strength & fitness' });
    brainHealth = new Regimen({ regimenName: 'brain health' });

    hypertrophy = new Tile({
      tileName: 'hypertrophy',
      mode: 'goal'
    });

    mobility = new Tile({
      tileName: 'mobility',
      mode: 'goal'
    });

    fitness.tiles.push(hypertrophy);
    fitness.tiles.push(mobility);

    Promise.all([fitness.save(), brainHealth.save(), hypertrophy.save(), mobility.save()])
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
      regimens: [fitness, brainHealth]
    });

    joe.save() // save returns a promise
      .then(() => {
        assert(!joe.isNew); // successfully saved
        done();
      });
  });

  it('generates a user regimen for upon saving new user', (done) => {
    const joe = new User({
      firstName: 'joe',
      lastName: 'howard',
      email: 'joe@gmail.com',
      password: 'password',
      mobile: '555-555-5555',
      sport: 'basketball',
      regimens: [fitness],
      userRegimens: []
    });

    joe.save()
      .then(() => User.findOne({ 'firstName': 'joe' }))
      .then((user) => {
        assert(user.userRegimens[0].userRegimenName == 'strength & fitness');
        assert(user.userRegimens[0].userTiles.length == 2);
        done();
      });
    });
});
