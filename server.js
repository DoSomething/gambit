'use strict';

const app = require('./app');
const config = require('./config');

const mongoose = require('mongoose');
mongoose.connect(config.dbUri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  return app.listen(config.port, () => {
    console.log(`Slothie is running on port=${config.port}.`);
  });
});
