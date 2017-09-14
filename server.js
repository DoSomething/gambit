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

const Campaign = require('./app/models/Campaign');

// Sync Campaign cache with Gambit Campaigns API.
Campaign.sync();
setInterval(() => { Campaign.sync(); }, config.campaignSyncInterval);

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
