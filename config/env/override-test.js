'use strict';

/**
 * Test environment overrides.
 *
 * Ignoring no-param-reassign eslint rule because it's exactly what we want here.
 */

/* eslint-disable no-param-reassign */


/**
 * Test DB settings
 */
const dbName = 'gambit-conversations-test';
let dbUri = `mongodb://localhost/${dbName}`;

// Running in wercker
if (process.env.MONGO_PORT_27017_TCP_ADDR) {
  dbUri = `mongodb://${process.env.MONGO_PORT_27017_TCP_ADDR}:${process.env.MONGO_PORT_27017_TCP_PORT}/${dbName}`;
}

module.exports = (config) => {
  config.dbUri = dbUri;
  config.rateLimiters.memberRoute.test = true;
};
