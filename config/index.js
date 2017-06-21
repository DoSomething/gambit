'use strict';

const configVars = {
  port: process.env.PORT || 5100,
  dbUri: process.env.MONGODB_URI || 'mongodb://localhost/slothie',
};

module.exports = configVars;
