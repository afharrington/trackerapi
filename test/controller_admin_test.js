const assert = require('assert');
const mongoose = require('mongoose');
const request = require('supertest');

const Admin = require('../models/Admin/admin_model.js');
const User = require('../models/User/user_model.js');
const Regimen = require('../models/Regimen/regimen_model.js');
const Tile = require('../models/Tile/tile_model.js');
const app = require('../app.js');

// Figure out why not working
// need to save admin as a property
describe('Admin controller', () => {
  let token, joe, jane, fitness;

  beforeEach((done) => {
    joe = new Admin({ firstName: 'joe', email: 'joe@gmail.com', password: 'password2' });
    brain = new Regimen({ regimenName: 'brain'});
    fitness = new Regimen({
      regimenName: 'strength & fitness',
      tiles: [{
        tileName: 'hypertrophy',
        mode: 'goal'
      },{
        tileName: 'mobility',
        mode: 'goal'
      }]
    });

    Promise.all([joe.save(), fitness.save()])
    .then(() => {
      jane = new User({
        firstName: 'jane',
        lastName: 'howard',
        email: 'jane@gmail.com',
        password: 'password3',
        mobile: '555-555-5555',
        sport: 'volleyball',
        regimens: [fitness],
        userRegimens: [],
        admin: joe._id
      });

      jane.regimens.forEach(regimen => {
          let userRegimen = {
            userRegimenName: regimen.regimenName,
            userTiles: []
          };
          if(regimen.tiles) {
            regimen.tiles.forEach(tile => {
              let userTile = {
                userTileName: tile.tileName,
                mode: tile.mode,
                continuousHours: tile.continuousHours,
                continuousDays: tile.continuousDays,
                goalHours: tile.goalHours,
                activityOptions: tile.activityOptions
              }
              userRegimen.userTiles.push(userTile);
            });
            jane.userRegimens.push(userRegimen);
          }
      });

      jane.save()

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


  it('POST to /admin/user creates a new user', done => {
    props = {
      firstName: 'alex',
      email: 'alex@gmail.com',
      password: 'password',
      regimens: [fitness]
    };

    request(app)
      .post('/admin/user')
      .set({'Authorization': token })
      .send(props)
      .expect(200)
      .end((err, res) => {
        if (err) { console.log(err) }
        assert(res.body.firstName === 'alex');
        done();
      });
    });


  it('GET to /admin/user/:userId', done => {
    request(app)
      .get(`/admin/user/${jane._id}`)
      .set({'Authorization': token })
      .end((err, res) => {
        assert(res.body.lastName === 'howard');
        done();
      })
  });

  // update
  it.only('PUT to /admin/user/:userId', done => {
    let userProps = {
      firstName: 'jane',
      lastName: 'howard',
      email: 'jane@gmail.com',
      password: 'password3',
      mobile: '555-555-5555',
      sport: 'volleyball',
      regimens: [fitness, brain],
      userRegimens: [],
      admin: joe._id
    }

    request(app)
      .put(`/admin/user/${jane._id}`)
      .set({'Authorization': token })
      .send(userProps)
      .end((err, res) => {
        //
        done();
      })
  });

  // update
  it('DELETE to /admin/user/:userId', done => {
    request(app)
      .get(`/admin/user/${jane._id}`)
      .set({'Authorization': token })
      .end((err, res) => {
        assert(res.body.lastName === 'howard');
        done();
      })
  });


  });
