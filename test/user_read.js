const assert = require('assert');
const User = require('../models/User/user_model');

describe('Reading users out of the database', () => {
  let joe;

  beforeEach((done) => {
    jason = new User({ firsName: 'Jason' });
    jim = new User({ firstName: 'Jim' });
    joe = new User({ firstName: 'Joe' });
    jordan = new User({ firstName: 'Jordan' });

    Promise.all([jason.save(), jim.save(), joe.save(), jordan.save()])
      .then(() => done());
  });

  it('finds all players with name Joe', (done) => {
    User.find({ firstName: 'Joe' })
      .then((users) => {
        assert(users[0]._id.toString() === joe._id.toString());
        done();
      });
  });

  it('finds a player with a particular id', (done) => {
    User.findOne({ _id: joe._id })
      .then((player) => {
        assert(user.firstName === 'Joe');
        done();
      });
  });

  it('can skip and limit the players result set', (done) => {
    User.find({})
      .sort({ firstName: 1 }) // alphabetical
      .skip(1)
      .limit(2)
      .then((users) => {
        assert(users.length == 2);
        assert(players[0].firstName == 'Jim');
        done();
      })
  });
});
