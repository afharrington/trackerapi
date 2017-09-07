const assert = require('assert');
const Admin = require('../models/AdminModel');
const Player = require('../models/PlayerModel');
const Profile = require('../models/ProfileModel');

describe('Associations', () => {
  let joe, player, profile;

  beforeEach((done) => {
    joe = new Admin({ first_name: 'Joe' });
    jane = new Player ({ first_name: 'Jane' });
    profile = new Profile ({ profile_name: 'profile1' });

    // Add Jane to the collection of players Joe manages
    joe.players.push(jane);
    // Add Joe as the admin for Jane's account
    jane.admin = joe;

    // Add profile to Joe's collection of profiles he authored
    joe.profiles.push(profile);
    // Add profile to Jane's collection of profiles assigned to her
    jane.profiles.push(profile);

    Promise.all([joe.save(), jane.save(), profile.save()])
      .then(() => done());
  });

  it('saves a relation between an admin and profile', (done) => {
    Admin.findOne({ first_name: 'Joe' })
      .populate('profiles')
      .then((admin) => {
        assert(admin.profiles[0].profile_name == 'profile1');
        done();
      });
  });

  it('saves a relation between an admin and player', (done) => {
    Admin.findOne({ first_name: 'Joe' })
      .populate('players')
      .then((admin) => {
        assert(admin.players[0].first_name == 'Jane');
        done();
      });
  });

  it('saves a relation between a player and admin', (done) => {
    Player.findOne({ first_name: 'Jane' })
      .populate('admin')
      .then((player) => {
        assert(player.admin.first_name == 'Joe');
        done();
      });
  });

  it('saves a relation between a player and profile', (done) => {
    Player.findOne({ first_name: 'Jane' })
      .populate('profiles')
      .then((player) => {
        assert(player.profiles[0].profile_name == 'profile1');
        done();
      });
  });

  it('saves nested relations', (done) => {
    Admin.findOne({ first_name: 'Joe' })
      .populate({
        path: 'players',
        populate: {
          path: 'profiles',
          model: 'Profile',
        }
      })
      .then((admin) => {
        assert(admin.first_name == 'Joe');
        assert(admin.players[0].first_name == 'Jane');
        assert(admin.players[0].profiles[0].profile_name == 'profile1');
        done();
      })
  });
});
