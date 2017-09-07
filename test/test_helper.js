const mongoose = require('mongoose');

// executed once for all tests
before((done) => {
  mongoose.connect('mongodb://localhost/threeup_test');
  const db = mongoose.connection;
  db
    .once('open', () => { done() })
    .on('error', (error) => {
      console.warn('Warning', error);
    });
});

// After collection has been dropped, call done() and run
// the next test
beforeEach((done) => {
  const { admins, profiles, players, people } = mongoose.connection.collections;
  admins.drop(() => {
    players.drop(() => {
      profiles.drop(() => {
        people.drop(() => {
          done();
        })
      });
    });
  });
});
