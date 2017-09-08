const mongoose = require('mongoose');

before((done) => {
  mongoose.connect('mongodb://localhost/threeup_test');
  const db = mongoose.connection;
  db
    .once('open', () => { done() })
    .on('error', (error) => {
      console.warn('Warning', error);
    });
});

beforeEach((done) => {
  const { admins, users, regimens, tiles, people } = mongoose.connection.collections;
  admins.drop(() => {
    users.drop(() => {
      regimens.drop(() => {
        tiles.drop(() => {
          people.drop(() => {
            done();
          });
        });
      });
    });
  });
});
