const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

const keys = require('./config/keys');
const routes = require('./router');

mongoose.Promise = global.Promise;

const port = process.env.PORT || 3000;
mongoose.connect(keys.mongoURI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const app = express();
app.listen(port);

// Parses incoming requests
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

routes(app);

console.log("3up API server listening on port:", port);
