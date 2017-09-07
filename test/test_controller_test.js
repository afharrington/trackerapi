const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');

const Person = require('../models/PersonSchema');
const app = require('../app.js');

describe('Test controller', () => {
  it('POST to /test creates a new person', done => {
    Person.count().then(count => {
      request(app)
        .post('/test')
        .send({ name: 'Anna' })
        .end(() => {
          Person.count().then(newCount => {
            assert(count + 1 == newCount);
            done();
          });
        });
    });
  });
});

describe('Test controller', () => {
  it('PUT to /test/:id edits an existing person', done => {
    const person = new Person({ name: 'Joe', adult: false });

    person.save().then(() => {
      request(app)
        .put(`/test/${person._id}`)
        .send({ adult: true })
        .end(() => {
          Person.findOne({ name: 'Joe' })
            .then(person => {
              assert(person.adult === true);
              done();
            });
        });
    });
  });
});

describe('Test controller', () => {
  it('DELETE to /test/:id deletes an existing person', done => {
    const person = new Person({ name: 'Joe' });

    person.save().then(() => {
      request(app)
        .delete(`/test/${person._id}`)
        .end(() => {
          Person.findOne({ name: 'Joe' })
            .then(person => {
              assert(person === null);
              done();
            });
        });
    });
  });
});
