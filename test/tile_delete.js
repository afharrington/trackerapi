const assert = require('assert');
const Tile = require('../models/Tile/tile_model');

describe('Deleting a tile', () => {
  let mobility;

  beforeEach((done) => {
    mobility = new Tile( { tileName: 'mobility' });
    mobility.save()
      .then(() => done());
  });

  it('removes tile with class method: remove', (done) => {
    Tile.remove({ tileName: 'mobility' })
      .then(() => Tile.findOne({ tileName: 'mobility'}))
      .then((tile) => {
        assert(tile === null);
        done();
      });
  });

  it('removes tile with class method: findOneAndRemove', (done) => {
     Tile.findOneAndRemove({ tileName: 'mobility' })
      .then(() => Tile.findOne({ tileName: 'mobility'}))
      .then((tile) => {
        assert(tile === null);
        done();
    });
  });

  it('class method: findByIdAndRemove', (done) => {
    Tile.findByIdAndRemove(mobility._id)
     .then(() => Tile.findOne({ tileName: 'mobility'}))
     .then((tile) => {
       assert(tile === null);
       done();
   });
 });
});
