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
  const loggerMsg = 'northstar.createNewClient';

  try {
    client = new Northstar({
      baseURI: process.env.DS_NORTHSTAR_API_BASEURI,
      apiKey: process.env.DS_NORTHSTAR_API_KEY,
    });
    logger.trace(`${loggerMsg} success`, client);
  } catch (err) {
    logger.error(`${loggerMsg} error`, err);
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

/**
 * @param {string} mobile
 * @return {Promise}
 */
module.exports.fetchUserByMobile = function (mobile) {
  logger.debug('fetchUserByMobile', { mobile });

  return exports.getClient().Users.get('mobile', mobile);
};

/**
 * @param {string} userId
 * @param {object} data
 * @return {Promise}
 */
module.exports.updateUser = function (userId, data) {
  return exports.getClient().Users.update(userId, data);
};
