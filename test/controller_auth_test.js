const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');

const Admin = require('../models/Admin/admin_model.js');
const User = require('../models/User/user_model.js');
const app = require('../app.js');

describe('Auth controller', () => {
  beforeEach((done) => {
    joe = new Admin({ firstName: 'joe', email: 'joe@gmail.com', password: 'password2' });
    jane = new User({ firstName: 'jane', email: 'jane@gmail.com', password: 'password3' });

    Promise.all([joe.save(), jane.save()])
      .then(() => done());
  });

  it('POST to /admin/new creates a new admin', done => {
    Admin.count().then(count => {
      request(app)
        .post('/admin/new')
        .send({
          firstName: 'jane',
          lastName: 'doe',
          email: 'jane@gmail.com',
          password: 'password' })
        .end(() => {
          Admin.count().then(newCount => {
            assert(count + 1 == newCount);
            done();
          });
        });
    });
  });

  it('POST to /admin/login receives status 200', done => {
    request(app)
      .post('/admin/login')
      .send({
        email: 'joe@gmail.com',
        password: 'password2'
      })
      .expect(200, done);
  });

  it('POST to /login receives status 200', done => {
    request(app)
      .post('/login')
      .send({
        email: 'jane@gmail.com',
        password: 'password3'
      })
      .expect(200, done);
  });

});
