'use strict';

const configVars = {
  campaignSyncInterval: process.env.DS_GAMBIT_CAMPAIGNS_SYNC_INTERVAL || 3600000,
  corsEnabled: process.env.CORS_DISABLED || true,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost/gambit-conversations',
  port: process.env.PORT || 5100,
};

module.exports = configVars;
