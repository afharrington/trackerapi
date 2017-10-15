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

  app.post('/admin', auth.create_admin);
  app.get('/admin', requireAdminAuth, auth.get_admin);
  app.put('/admin', requireAdminAuth, auth.update_admin);
  app.post('/admin/login', requireAdminLogin, auth.admin_login);
  app.post('/user/login', requireUserLogin, auth.user_login);
  app.put('/admin/register', auth.register_admin);
  app.put('/user/register', auth.register_user);


  // ADMIN ROUTES ===========================================================>>

  // Managing user accounts
  app.get('/admin/user', requireAdminAuth, admin.get_all_users);
  app.post('/admin/user', requireAdminAuth, admin.create_user);
  app.get('/admin/user/:userId', requireAdminAuth, admin.get_user);
  app.put('/admin/user/:userId', requireAdminAuth, admin.update_user);
  app.delete('/admin/user/:userId', requireAdminAuth, admin.delete_user);
  app.get('/admin/user/:userId/usertile/:userTileId', requireAdminAuth, admin.get_user_tile);

  // Managing regimens
  app.get('/admin/regimen', requireAdminAuth, admin.get_all_regimens);
  app.post('/admin/regimen', requireAdminAuth, admin.create_regimen);
  app.get('/admin/regimen/:regimenId', requireAdminAuth, admin.get_regimen);
  app.get('/admin/regimen/:regimenId/users', requireAdminAuth, admin.get_user_regimens);
  app.put('/admin/regimen/:regimenId', requireAdminAuth, admin.update_regimen);
  app.delete('/admin/regimen/:regimenId', requireAdminAuth, admin.delete_regimen);
  app.post('/admin/regimen/:regimenId', requireAdminAuth, admin.create_tile);
  app.get('/admin/regimen/:regimenId/tile/:tileId/users', requireAdminAuth, admin.get_user_tiles);

  // Managing tiles
  app.post('/admin/regimen/:regimenId/tile/:tileId', requireAdminAuth, admin.add_activity);
  app.put('/admin/regimen/:regimenId/tile/:tileId', requireAdminAuth, admin.update_tile);
  app.delete('/admin/regimen/:regimenId/tile/:tileId', requireAdminAuth, admin.delete_tile);

// USER ROUTES ===========================================================>>

  // Managing user account
  app.get('/user', requireUserAuth, user.get_user);
  app.put('/', requireUserAuth, user.update_user);

  // Accessing all user regimens
  // app.get('/user', requireUserAuth, user.get_regimens);

  // Accessing specific user regimen with tiles
  app.get('/user/reg/:regId', requireUserAuth, user.get_regimen);

  // Updating specific tiles
  app.get('/user/reg/:regId/tile/:tileId', requireUserAuth, user.get_tile);
  app.post('/user/reg/:regId/tile/:tileId', requireUserAuth, user.add_entry);
  app.put('/user/reg/:regId/tile/:tileId/cycle/:cycleId/entry/:entryId', requireUserAuth, user.update_entry);
  app.delete('/user/reg/:regId/tile/:tileId/cycle/:cycleId/entry/:entryId', requireUserAuth, user.delete_entry);
}
