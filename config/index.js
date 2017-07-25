'use strict';

const configVars = {
  corsEnabled: process.env.CORS_DISABLED || true,
  port: process.env.PORT || 5100,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost/gambit-conversations',
};

module.exports = configVars;
