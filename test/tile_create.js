const assert = require('assert');
const Tile = require('../models/Tile/tile_model');

describe('Creating an tile', () => {
  it('creates a tile', (done) => {
    const mobility = new Tile({
      tileName: 'Mobility',
      mode: 'goal',
      continuousHours: null,
      continuousDays: null,
      goalHours: 3,
      goalCycle: 'week',
      activityOptions: ['Arms', 'Torso', 'Hips', 'Legs']
    });
    mobility.save()
      .then(() => {
        assert(!mobility.isNew);
        done();
      });
  });
});
