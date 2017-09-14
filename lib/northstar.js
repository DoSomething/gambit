'use strict';

/**
 * Imports.
 */
const Northstar = require('@dosomething/northstar-js');
const logger = require('heroku-logger');

/**
 * Setup.
 */
let client;

/**
 * @return {Object}
 */
module.exports.createNewClient = function createNewClient() {
  try {
    client = new Northstar({
      baseURI: process.env.DS_NORTHSTAR_API_BASEURI,
      apiKey: process.env.DS_NORTHSTAR_API_KEY,
    });
  } catch (err) {
    logger.error('northstar.createNewClient', err);
  }
  return client;
};

/**
 * @return {Object}
 */
module.exports.getClient = function getClient() {
  if (!client) {
    return exports.createNewClient();
  }
  return client;
};
