const assert = require('assert');
const User = require('../models/User/user_model');
const Regimen = require('../models/Regimen/regimen_model');
const Tile = require('../models/Tile/tile_model');

describe('Creating a user', () => {
  let fitness;

  beforeEach((done) => {
    fitness = new Regimen({
      regimenName: 'strength & fitness',
      tiles: [{
        tileName: 'hypertrophy',
        mode: 'goal'
      },{
        tileName: 'mobility',
        mode: 'goal'
      }]
    });

    brainHealth = new Regimen({ regimenName: 'brain health' });

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
      regimens: [fitness],
      userRegimens: []
    });

    joe.regimens.forEach(regimen => {
        let userRegimen = {
          userRegimenName: regimen.regimenName,
          userTiles: []
        };
        if(regimen.tiles) {
          regimen.tiles.forEach(tile => {
            let userTile = {
              userTileName: tile.tileName,
              mode: tile.mode,
              continuousHours: tile.continuousHours,
              continuousDays: tile.continuousDays,
              goalHours: tile.goalHours,
              activityOptions: tile.activityOptions
            }
            userRegimen.userTiles.push(userTile);
          });
          joe.userRegimens.push(userRegimen);
        }
    });

    joe.save()
      .then(() => {
        assert(!joe.isNew);
        done();
      });
  });

});
