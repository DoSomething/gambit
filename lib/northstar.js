'use strict';

/**
 * Imports.
 */
const northstar = require('@dosomething/northstar-js');
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
    client = new NorthstarClient({
      baseURI: process.env.DS_NORTHSTAR_API_BASEURI,
      apiKey: process.env.DS_NORTHSTAR_API_KEY,
    });
  } catch (err) {
    logger.error('northstar.createNewClient', error);
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