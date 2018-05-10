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

const rivescript = require('./lib/rivescript');
const rivescriptHelper = require('./lib/helpers/rivescript');

const dir = './brain/contentful';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

/**
 * Fetch default Rivescrippt topic triggers from Contentful to write chatbot Rivescript.
 */
rivescriptHelper.fetchDefaultRivescriptTopicTriggers()
  .then((rivescriptTriggers) => {
    const filename = `${dir}/default.rive`;
    const data = rivescriptTriggers.join('\n');
    fs.writeFile(filename, data, ((err) => {
      logger.debug('writeFile', { filename });
      if (err) logger.error('writeFile', { err });
    }));
    logger.info('fetchDefaultRivescriptTopicTriggers success', { count: rivescriptTriggers.length });
    // Load the Rivescript bot.
    rivescript.getBot();
  })
  .catch(err => logger.error('fetchDefaultRivescriptTopicTriggers', { err }));


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
