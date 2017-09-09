const assert = require('assert');
const Tile = require('../models/Tile/tile_model');

describe('Reading admins out of the database', () => {
  let mobility;

  beforeEach((done) => {
    mobility = new Tile({ tileName: 'mobility' })
    mobility.save()
      .then(() => done());
  });

  it('finds all tiles with name mobility', (done) => {
    Tile.find({ tileName: 'mobility' })
      .then((tiles) => {
        assert(tiles[0]._id.toString() === mobility._id.toString());
        done();
      });
  });

  it('finds a tile with a particular id', (done) => {
    Tile.findOne({ _id: mobility._id })
      .then((tile) => {
        assert(tile.tileName === 'mobility');
        done();
      });
  });
});
