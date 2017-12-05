const auth = require('../controllers/auth_controller');
const admin = require('../controllers/admin_controller');
const user = require('../controllers/user_controller');
const test = require('../controllers/test_controller');
const config = require('../config/keys.js');
const passportService = require("../services/passport");
const passport = require("passport");

const requireUserLogin = passport.authenticate('userLocal', { session: false });
const requireUserAuth = passport.authenticate('userJwt', { session: false });
const requireAdminLogin = passport.authenticate('adminLocal', { session: false });
const requireAdminAuth = passport.authenticate('adminJwt', { session: false });

module.exports = function(app) {

  // AUTHENICATION ROUTES ===================================================>>

  app.post('/admin', auth.create_admin);
  app.get('/admin', requireAdminAuth, auth.get_admin);
  app.put('/admin', requireAdminAuth, auth.update_admin);
  app.post('/admin/login', requireAdminLogin, auth.admin_login);
  app.post('/user/login', requireUserLogin, auth.user_login);
  app.put('/admin/register', auth.register_admin);
  app.put('/user/register', auth.register_user);


  // ADMIN ROUTES ===========================================================>>

  app.get('/admin/recent', requireAdminAuth, admin.get_recent_entries);

  // Managing user accounts
  app.get('/admin/users', requireAdminAuth, admin.get_users);
  app.post('/admin/user', requireAdminAuth, admin.create_user);
  app.get('/admin/user/:userId', requireAdminAuth, admin.get_user);
  app.put('/admin/user/:userId', requireAdminAuth, admin.update_user);
  app.delete('/admin/user/:userId', requireAdminAuth, admin.delete_user);

  // Managing programs
  app.get('/admin/programs', requireAdminAuth, admin.get_programs);
  app.post('/admin/program', requireAdminAuth, admin.create_program);
  app.get('/admin/program/:programId', requireAdminAuth, admin.get_program);
  app.get('/admin/program/:programId/tiles', requireAdminAuth, admin.get_program_tiles);
  app.put('/admin/program/:programId', requireAdminAuth, admin.update_program);
  app.delete('/admin/program/:programId', requireAdminAuth, admin.delete_program);
  app.get('/admin/program/:programId/usertiles', requireAdminAuth, admin.get_program_user_tiles);

  // Managing tiles
  app.post('/admin/program/:programId', requireAdminAuth, admin.create_tile);
  app.put('/admin/tile/:tileId', requireAdminAuth, admin.update_tile);
  app.delete('/admin/tile/:tileId', requireAdminAuth, admin.delete_tile);
  app.get('/admin/tile/:tileId/usertiles', requireAdminAuth, admin.get_tile_user_tiles);

  // Managing specific user tiles and programs
  app.get('/admin/user/program/:userProgramId', requireAdminAuth, admin.get_user_program);
  app.get('/admin/user/program/:userProgramId/tiles', requireAdminAuth, admin.get_user_program_tiles);
  app.get('/admin/user/:userId/programs', requireAdminAuth, admin.get_this_user_programs);
  app.get('/admin/program/:programId/users', requireAdminAuth, admin.get_user_programs);
  app.get('/admin/user/tile/:userTileId', requireAdminAuth, admin.get_user_tile);
  app.get('/admin/tile/:tileId/users', requireAdminAuth, admin.get_user_tiles);

  app.post('/admin/user/tile/:userTileId', requireAdminAuth, admin.add_entry);
  app.put('/admin/user/cycle/:cycleId/entry/:entryId', requireAdminAuth, admin.update_entry);
  app.delete('/admin/user/cycle/:cycleId/entry/:entryId', requireAdminAuth, admin.delete_entry);

// USER ROUTES ===========================================================>>

  // Managing user account
  app.get('/user', requireUserAuth, user.get_user);
  app.put('/user', user.update_user);

  // Accessing all user programs
  // app.get('/user', requireUserAuth, user.get_programs);

  // Accessing specific user program with tiles
  app.get('/user/reg/:regId', requireUserAuth, user.get_program);

  // Updating specific tiles
  app.get('/user/reg/:regId/tile/:tileId', requireUserAuth, user.get_tile);
  app.post('/user/reg/:regId/tile/:tileId', requireUserAuth, user.add_entry);

  app.put('/user/reg/:regId/tile/:tileId/cycle/:cycleId/entry/:entryId', requireUserAuth, user.update_entry);
  app.delete('/user/reg/:regId/tile/:tileId/cycle/:cycleId/entry/:entryId', requireUserAuth, user.delete_entry);
}
