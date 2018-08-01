'use strict';

// Load enviroment vars.
require('dotenv').config();

// @see https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration
require('newrelic');

const config = require('./config');
require('./config/mongoose')(config.dbUri);

const app = require('./app');
const mongoose = require('mongoose');
const helpers = require('./lib/helpers');
const logger = require('./lib/logger');

helpers.rivescript.loadBot()
  // TODO: Retry loading Bot if an error occurred.
  .catch(error => logger.error('loadBot error', { error }));

const db = mongoose.connection;
db.on('error', () => {
  // TODO console.log has to be replaced by other development logging library: Winston?
  // console.error.bind(console, 'connection error:');
});
db.once('open', () => {
  app.listen(config.port, () => {
    // TODO console.log has to be replaced by other development logging library: Winston?
    // console.log(`Conversations API is running on port=${config.port}.`);
  });
});
