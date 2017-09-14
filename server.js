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

// Sync Campaign cache with Gambit Campaigns API.
const CampaignModel = require('./app/models/Campaign');

CampaignModel.sync();
if (process.env.DS_GAMBIT_CAMPAIGNS_SYNC) {
  setInterval(() => { CampaignModel.sync() }, 50000);
}

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
