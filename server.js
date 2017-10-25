'use strict';

// Load enviroment vars.
require('dotenv').config();

// @see https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration
require('newrelic');

const app = require('./app');
const mongoose = require('mongoose');
const config = require('./config');

mongoose.Promise = global.Promise;
// http://mongoosejs.com/docs/connections.html#use-mongo-client
// TODO: what happens if database doesnt connect?
mongoose.connect(config.dbUri, {
  useMongoClient: true,
});

const logger = require('heroku-logger');
const fs = require('fs');
const contentful = require('./lib/contentful');
const rivescript = require('./lib/rivescript');

const dir = './brain/contentful';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

// Fetch rivescript files from Contentful.
contentful.fetchRivescripts()
  .then((entries) => {
    entries.forEach((entry) => {
      const id = entry.sys.id;
      const script = entry.fields.rivescript;
      const filename = `${dir}/${id}.rive`;
      // Write them.
      fs.writeFile(filename, script, ((err) => {
        if (err) logger.error('writeFile', { err });
      }));
    });
    // Load the Rivescript bot.
    rivescript.getBot();
  })
  .catch(err => logger.error('fetchRivescripts', { err }));


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
