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
const fs = require('fs');

const helpers = require('./lib/helpers');
const rivescript = require('./lib/rivescript');

const dir = './brain/contentful';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

function writeFile(name, data) {
  const filename = `${dir}/${name}.rive`;
  fs.writeFile(filename, data, ((err) => {
    logger.debug('writeFile', { filename });
    if (err) logger.error('writeFile', { err });
  }));
}

/**
 * Fetch all default topic triggers to create additional Rivescript for chatbot replies.
 */
helpers.topic.fetchAllDefaultTopicTriggers()
  .then((defaultTopicTriggers) => {
    logger.info('fetchAllDefaultTopicTriggers', { count: defaultTopicTriggers.length });
    const defaultTopicRivescripts = helpers.rivescript
      .getRivescriptFromDefaultTopicTriggers(defaultTopicTriggers);
    writeFile('default', defaultTopicRivescripts);
    rivescript.getBot();
  })
  .catch(err => logger.error('error writing rivescript', { err }));


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
