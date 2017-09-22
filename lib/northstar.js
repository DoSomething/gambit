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
 * @param {string} mobile
 * @return {Promise}
 */
module.exports.createUserForMobile = function (mobile) {
  const opts = config.createUserOptions;
  // Northstar User creation requires a password:
  const password = encrypt(mobile, opts.passwordAlgorithm, opts.passwordKey);
  // And requires an email. For Users created with from only mobile number, set a default email.
  const email = `${mobile}@${opts.defaultEmailDomain}`;

  const data = {
    email,
    mobile,
    source: opts.source,
  };
  logger.debug('northstar.createUser', data);
  data.password = password;

  return exports.getClient().Users.create(data);
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
