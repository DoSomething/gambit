'use strict';

/**
 * Imports.
 */
const Northstar = require('@dosomething/northstar-js');
const logger = require('heroku-logger');
const config = require('../config/lib/northstar');

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
    client = new Northstar(config.clientOptions);
    logger.debug(`${loggerMsg} success`);
  } catch (err) {
    logger.error(`${loggerMsg} error`, { err });
    throw new Error(err.message);
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
 * @param {string} data
 * @return {Promise}
 */
module.exports.createUser = function (data) {
  return exports.getClient().Users.create(data);
};

/**
 * @param {string} id The Northstar id for this user
 * @return {Promise}
 */
module.exports.fetchUserById = function (id) {
  logger.debug('fetchUserById', { id });
  return exports.getClient().Users.get(config.getUserFields.id, id);
};

/**
 * @param {string} id The Northstar id for this user
 * @return {Promise}
 */
module.exports.unauthenticatedFetchUserById = function (id) {
  logger.debug('fetchUserByIdUnauthenticated', { id });
  return exports.getClient().Users.anonGet(config.getUserFields.id, id);
};

/**
 * @param {string} email
 * @return {Promise}
 */
module.exports.fetchUserByEmail = function (email) {
  logger.debug('fetchUserByEmail', { email });

  return exports.getClient().Users.get(config.getUserFields.email, email);
};

/**
 * @param {string} mobile
 * @return {Promise}
 */
module.exports.fetchUserByMobile = function (mobile) {
  logger.debug('fetchUserByMobile', { mobile });

  return exports.getClient().Users.get(config.getUserFields.mobile, mobile);
};

/**
 * @param {string} userId
 * @param {object} data
 * @return {Promise}
 */
module.exports.updateUser = function (userId, data) {
  logger.debug('northstar.updateUser post', { userId, data });

  return exports.getClient().Users.update(userId, data);
};
