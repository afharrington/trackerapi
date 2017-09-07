const assert = require('assert');
const Player = require('../models/PlayerModel');

describe('Reading players out of the database', () => {
  let jane;

  beforeEach((done) => {
    jane = new Player({ first_name: 'Jane' });
    jason = new Player({ first_name: 'Jason' });
    jim = new Player({ first_name: 'Jim' });
    jordan = new Player({ first_name: 'Jordan' });

    Promise.all([jane.save(), jason.save(), jim.save(), jordan.save()])
      .then(() => done());
  });

  it('finds all players with name Jane', (done) => {
    Player.find({ first_name: 'Jane' })
      .then((players) => {
        assert(players[0]._id.toString() === jane._id.toString());
        done();
      });
  });

  it('finds a player with a particular id', (done) => {
    Player.findOne({ _id: jane._id })
      .then((player) => {
        assert(player.first_name === 'Jane');
        done();
      });
  });

  it('can skip and limit the players result set', (done) => {
    Player.find({})
      .sort({ first_name: 1 })
      .skip(1)
      .limit(2)
      .then((players) => {
        assert(players.length == 2);
        assert(players[0].first_name == 'Jason');
        done();
      })
  });
});
