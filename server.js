'use strict';

// Load enviroment vars.
require('dotenv').config();

// @see https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration
require('newrelic');

const config = require('./config');
require('./config/mongoose')(config.dbUri);

const app = require('./app');
const mongoose = require('mongoose');
const logger = require('heroku-logger');

const helpers = require('./lib/helpers');
const rivescript = require('./lib/rivescript');

/**
 * Fetch additional Rivescript from Content API and load the Rivescript bot.
 */
helpers.rivescript.fetchRivescript()
  .then(data => rivescript.createNewBot(data))
  // TODO: Retry fetching Rivescript on error.
  .catch(error => logger.error('fetchRivescript', { error }));

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
