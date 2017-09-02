// prod.js -- mlab database for production only (heroku env)
module.exports = {
  mongoURI: process.env.MONGO_URI,
  secret: process.env.SECRET_KEY
}
