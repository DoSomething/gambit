'use strict';

const configVars = {
  corsEnabled: process.env.CORS_DISABLED || true,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost/gambit-conversations',
  port: process.env.PORT || 5100,
};

module.exports = configVars;
