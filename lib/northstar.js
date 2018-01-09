'use strict';

/**
 * Imports.
 */
const Northstar = require('@dosomething/northstar-js');
const crypto = require('crypto');
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
  const opts = config.clientOptions;

  try {
    client = new Northstar({
      baseURI: opts.baseUri,
      apiKey: opts.apiKey,
    });
    logger.info(`${loggerMsg} success`);
  } catch (err) {
    logger.error(`${loggerMsg} error`, { err });
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
 * Encrypts given string with given algorithm and key params.
 * @param {string} string - String to encrypt
 * @param {string} algorithm
 * @param {string} key
 * @return {string}
 */
function encrypt(string, algorithm, key) {
  return crypto
    .createHmac(algorithm, key)
    .update(string)
    .digest('hex')
    .substring(0, 6);
}

/**
 * @param {string} data
 * @return {Promise}
 */
module.exports.createUser = function (data) {
  const scope = data;
  const opts = config.createUserOptions;
  scope.source = opts.source;
  logger.debug('northstar.createUser', data);
  // Northstar User creation requires setting a password:
  scope.password = encrypt(data.mobile, opts.passwordAlgorithm, opts.passwordKey);

  return exports.getClient().Users.create(scope);
};

/**
 * @param {string} id The Northstar id for this user
 * @return {Promise}
 */
module.exports.fetchUserById = function (id) {
  logger.debug('fetchUserById', { id });

  return exports.getClient().Users.get('id', id);
};

/**
 * @param {string} email
 * @return {Promise}
 */
module.exports.fetchUserByEmail = function (email) {
  logger.debug('fetchUserByEmail', { email });

  return exports.getClient().Users.get('email', email);
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
  logger.debug('northstar.updateUser post', { userId, data });

  return exports.getClient().Users.update(userId, data);
};
