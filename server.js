'use strict';

const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.connect(config.dbUri);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  app.listen(config.port, () => {
    console.log(`Slothie is running on port=${config.port}.`);
  });
});
