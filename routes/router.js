const auth = require('../controllers/auth_controller');
const admin = require('../controllers/admin_controller');
const user = require('../controllers/user_controller');
const test = require('../controllers/test_controller');

const passportService = require("../services/passport");
const passport = require("passport");

const requireUserLogin = passport.authenticate('userLocal', { session: false });
const requireUserAuth = passport.authenticate('userJwt', { session: false });
const requireAdminLogin = passport.authenticate('adminLocal', { session: false });
const requireAdminAuth = passport.authenticate('adminJwt', { session: false });

module.exports = function(app) {

  // TEST ROUTES
  app.post('/test', test.create);
  app.put('/test/:id', test.edit);
  app.delete('/test/:id', test.delete);

  // AUTHENICATION ROUTES ===================================================>>
  // Need to add PUT and DELETE for admin accounts

  app.post('/admin', auth.create_admin); // sign up new admin, then send token
  app.post('/admin/login', requireAdminLogin, auth.login_admin); // authorize login, then send token
  app.post('/login', requireUserLogin, auth.login_user); // authorize user login, then send token

  // ADMIN ROUTES ===========================================================>>

  // Managing user accounts
  app.get('/admin', requireAdminAuth, admin.get_admin);
  app.post('/admin/user', requireAdminAuth, admin.create_user);
  app.get('/admin/user/:userId', requireAdminAuth, admin.get_user);
  app.put('/admin/user/:userId', requireAdminAuth, admin.update_user);
  app.delete('/admin/user/:userId', requireAdminAuth, admin.delete_user);
  app.post('/admin/user/:userId', requireAdminAuth, admin.assign_regimens)

  // Managing regimens
  app.get('/admin/regimen', requireAdminAuth, admin.get_all_regimens);
  app.post('/admin/regimen', requireAdminAuth, admin.create_regimen);
  app.get('/admin/regimen/:regimenId', requireAdminAuth, admin.get_regimen);
  app.put('/admin/regimen/:regimenId', requireAdminAuth, admin.update_regimen);
  app.delete('/admin/regimen/:regimenId', requireAdminAuth, admin.delete_regimen);
  app.post('/admin/regimen/:regimenId', requireAdminAuth, admin.create_tile);

  // Managing tiles
  app.put('/admin/regimen/:regimenId/tile/:tileId', requireAdminAuth, admin.update_tile);
  app.delete('/admin/regimen/:regimenId/tile/:tileId', requireAdminAuth, admin.delete_tile);

// PLAYER ROUTES ===========================================================>>

  // app.get('/', requireUserAuth, user.get_user);
// app.get('/player/tiles', requirePlayerAuth, player.get_all_tiles); // will get all the player's tiles - this will also generate tiles based on the profile if they don't already exist
//
//   app.get('/player/tiles/:tileId', requirePlayerAuth, player.get_entries); // get entries for a specifc tile
//   app.post('/player/tiles/:tileId', requirePlayerAuth, player.add_entry); // add an entry to a tile
//   app.put('/player/tiles/:tileId', requirePlayerAuth, player.update_tile_color); // update a tile's color value
//
//   app.delete('/player/tile/:tileId/entry/:entryId', requirePlayerAuth, player.delete_entry); // delete an entry
//   app.put('/player/tile/:tileId/entry/:entryId', requirePlayerAuth, player.update_entry); // edit an entry
// };
}
