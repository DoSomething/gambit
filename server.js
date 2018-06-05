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
helpers.topic.fetchAllDefaultTopicTriggers()
  .then((defaultTopicTriggers) => {
    logger.info('fetchAllDefaultTopicTriggers success', { count: defaultTopicTriggers.length });
    return helpers.rivescript.writeRivescriptFromDefaultTopicTriggers(defaultTopicTriggers);
  })
  // Note: We plan to support topic-specific triggers by adding a triggers property to topics.
  // Once the property/data exists, we'll make another query to the Content API to fetch all topics
  // that contain their own triggers, and write them as Rivescript topics.
  // @see https://github.com/DoSomething/gambit-conversations/blob/77ff4b13b71d73d7f2b286ad9691d6c79c3309da/lib/helpers/rivescript.js#L81
  .then((opts) => {
    logger.info('writeRivescriptFromDefaultTopicTriggers success', { opts });
    rivescript.getBot();
  })
  .catch(error => logger.error('fetchAllDefaultTopicTriggers', { error }));

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
