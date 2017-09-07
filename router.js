const auth = require("./controllers/authController");
const admin = require("./controllers/adminController");
const player = require("./controllers/playerController");
// const cors = require("cors");

const passportService = require("./services/passport");
const passport = require("passport");

const requirePlayerLogin = passport.authenticate('playerLocal', { session: false });
const requirePlayerAuth = passport.authenticate('playerJwt', { session: false });
const requireAdminLogin = passport.authenticate('adminLocal', { session: false });
const requireAdminAuth = passport.authenticate('adminJwt', { session: false });

module.exports = function(app) {

  // Handle CORS
  app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE");
    next();
  });

  // app.use(cors());

  // AUTHENTICATION ROUTES ==================================================>>

  app.post('/admin/signup', auth.admin_signup); // sign up new admin, then send token
  app.post('/admin/login', requireAdminLogin, auth.admin_login); // authorize login, then send token
  app.post('/login', requirePlayerLogin, auth.login); // authorize user login, then send token

  // ADMIN ROUTES ===========================================================>>

  app.get('/admin', requireAdminAuth, admin.get_admin_dashboard);
  app.post('/admin/player', requireAdminAuth, admin.add_player);
  app.get('/admin/player/:playerId', requireAdminAuth, admin.get_player);
  app.put('/admin/player/:playerId', requireAdminAuth, admin.update_player);
  app.delete('/admin/player/:playerId', requireAdminAuth, admin.delete_player);

  app.post('/admin/profile', requireAdminAuth, admin.create_profile);
  app.get('/admin/profile/:profileId', requireAdminAuth, admin.get_profile);
  app.put('/admin/profile/:profileId', requireAdminAuth, admin.update_profile);
  app.delete('/admin/profile/:profileId', requireAdminAuth, admin.delete_profile);

  app.post('/admin/profile/:profileId', requireAdminAuth, admin.create_tile_profile);
  app.get('/admin/profile/:profileId/tileprofile/:tileProfileId', requireAdminAuth, admin.get_tile_profile);
  app.put('/admin/profile/:profileId/tileprofile/:tileProfileId', requireAdminAuth, admin.update_tile_profile);
  app.delete('/admin/profile/:profileId/tileprofile/:tileProfileId', requireAdminAuth, admin.delete_tile_profile);

// PLAYER ROUTES ===========================================================>>

  app.get('/', requirePlayerAuth, player.get_player_dashboard); // get general player info
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
