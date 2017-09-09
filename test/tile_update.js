const assert = require('assert');
const Tile = require('../models/Tile/tile_model');

describe('Updating tile record', () => {
  let mobility;

  beforeEach((done) => {
    mobility = new Tile({ tileName: 'mobility' });
    mobility.save()
      .then(() => done());
  });

  // Helper function for below - takes an operation, searches all
  // tiles, and tests for change to tileName property
  function assertName(operation, done) {
    operation
    .then(() => Tile.find({}))
    .then((tiles) => {
      assert(tiles.length === 1);
      assert(tiles[0].tileName === 'flexibility');
      done();
    });
  }

  // Use for incremental updates over time
  it('model instance updates with set and save method', (done) => {
    mobility.set('tileName', 'flexibility');
    assertName(mobility.save(), done);
  });

  // Use for bulk / instantaneous updates
  it('model instance updates with update method', (done) => {
    assertName(mobility.update({ tileName: 'flexibility'}), done);
  });

  // Update all records matching criteria
  it('model class updates multiple matching records', (done) => {
      assertName(
        Tile.update({ tileName: 'mobility' }, { tileName: 'flexibility' }),
        done
      );
  });

  // Update a specific record matching criteria
  it('model class updates a single record', (done) => {
      assertName(
        Tile.findOneAndUpdate({ tileName: 'mobility' }, { tileName: 'flexibility' }),
        done
      );
  });

  // Update a specific record matching id
  it('model class finds a record by id and updates', (done) => {
      assertName(
        Tile.findByIdAndUpdate(mobility._id, { tileName: 'flexibility' }),
        done
      );
  });
});
