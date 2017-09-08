const assert = require('assert');
const Profile = require('../models/Regimen/regimen_model');

describe('Regimen subdocuments', () => {
  it('can a tile profile subdocument to a new profile', (done) => {
    const profile = new Profile({
      profile_name: 'profile1',
      tile_profiles: [{ tile_name: 'tile1'}]
    });

    profile.save()
      .then(() => Profile.findOne({ profile_name: 'profile1'}))
      .then((profile) => {
        assert(profile.tile_profiles[0].tile_name === 'tile1');
        done();
      });
  });


  it('can create a tile profile subdocument to an existing profile', (done) => {
    // create initial profile
    const profile = new Profile({
      profile_name: 'profile1',
      tile_profiles: []
    });

    profile.save()
      // fetch saved profile
      .then(() => Profile.findOne({ profile_name: 'profile1'}))

      // add a new tile profile to the list of tile profiles and save
      .then((profile) => {
        profile.tile_profiles.push({ tile_name: 'tile1'});
        // no implicit return with curly braces so must add return statement
        return profile.save();
      })
      // fetch the profile again and check for the new tile
      .then(() => Profile.findOne( {profile_name: 'profile1'}))
      .then((profile) => {
        assert(profile.tile_profiles[0].tile_name === 'tile1');
        done();
      });
  });

  it('can remove an existing tile profile subdocument', (done) => {
    const profile = new Profile({
      profile_name: 'profile1',
      tile_profiles: [{ tile_name: 'tile1' }]
    });

    profile.save()
      .then(() => Profile.findOne({ profile_name: 'profile1'}))
      .then((profile) => {
        const tile_profile = profile.tile_profiles[0];
        tile_profile.remove();
        return profile.save();
      })
      .then(() => Profile.findOne({ profile_name: 'profile1'}))
      .then((profile) => {
        assert(profile.tile_profiles.length === 0);
        done();
      });
  });


});
