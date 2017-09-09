const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');

const Admin = require('../models/Admin/admin_model.js');
const User = require('../models/User/user_model.js');
const app = require('../app.js');

describe('Auth controller', () => {
  let token;

  beforeEach((done) => {
    joe = new Admin({ firstName: 'joe', email: 'joe@gmail.com', password: 'password2' });
    jane = new User({ firstName: 'jane', email: 'jane@gmail.com', password: 'password3' });

    Promise.all([joe.save(), jane.save()])

      .then(() => {
        request(app)
          .post('/admin/login')
          .send({
            email: 'joe@gmail.com',
            password: 'password2'
          })
          .end(function(err, res) {
            if (err || !res.ok) {
              console.log('Authentication failed');
            } else {
              token = `JWT ${res.body.token}`;
            }
            done();
          });
      });
  });

  it('GET to /admin', done => {
    request(app)
      .get('/admin')
      .set({'Content-Type': 'applicaton/json', 'Authorization': token })
      .send({
          email: 'joe@gmail.com',
          password: 'password2' })
      .end((err, res) => {
        let admin = res.body;
        assert(admin.firstName === 'joe');
        done();
      });
    });

  it.only('POST to /admin/user creates a new user', done => {
    request(app)
      .post('/admin/user')
      .set({'Authorization': token })
      .send({
        firstName: "alex",
        email: "alex@gmail.com",
        password: "password" })
      .expect(200)
      .end((err, res) => {
        if (err) { console.log('error') }
        assert(res.body.firstName === 'alex');
        done();
      });
    });


  });
