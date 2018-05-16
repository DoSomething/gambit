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

function writeFile(name, strings) {
  const filename = `${dir}/${name}.rive`;
  const data = strings.join('\n');
  fs.writeFile(filename, data, ((err) => {
    logger.debug('writeFile', { filename });
    if (err) logger.error('writeFile', { err });
  }));
}

/**
 * Fetch Rivescript from Contentful to load chatbot replies for member messages.
 */
rivescriptHelper.fetchDefaultTopicTriggers()
  .then((triggers) => {
    logger.info('fetchDefaultTopicTriggers', { count: triggers.length });
    writeFile('default', triggers);
    return rivescriptHelper.fetchTopics();
  })
  .then((topics) => {
    logger.info('fetchTopics', { count: topics.length });
    writeFile('topics', topics);
    // Load the Rivescript bot.
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
