'use strict';

const crypto = require('crypto');
const superagent = require('superagent');
const logger = require('heroku-logger');
const config = require('../config/lib/front');

/**
 * @param {string} uri
 * @return {Promise}
 */
module.exports.get = function (uri) {
  return superagent
    .get(uri)
    .set('Authorization', module.exports.getAuthString());
};

/**
 * @param {string} endpoint
 * @param {object} data
 * @return {Promise}
 */
function post(endpoint, data) {
  return superagent
    .post(`${config.clientOptions.baseUri}/${endpoint}`)
    .set('Authorization', module.exports.getAuthString())
    .send(data);
}

/**
 * @return {string}
 */
module.exports.getAuthString = function () {
  return `Bearer ${config.clientOptions.apiToken}`;
};

/**
 * @return {string}
 */
module.exports.getSupportChannelPath = function () {
  return `channels/${config.channels.support}/incoming_messages`;
};

/**
 * @param {string} senderHandle
 * @param {string} messageText
 * @return {object}
 */
module.exports.getMessagePayload = function (senderHandle, messageText) {
  return {
    sender: {
      handle: senderHandle,
    },
    body: messageText,
  };
};

/**
 * @param {string} senderHandle
 * @param {string} messageText
 * @return {Promise}
 */
module.exports.postMessage = function (senderHandle, messageText) {
  const endpoint = module.exports.getSupportChannelPath();
  const data = module.exports.getMessagePayload(senderHandle, messageText);
  logger.debug('front.postMessage request', { endpoint, data });
  return post(endpoint, data);
};

/**
 * Validates incoming Front request.
 * @see https://dev.frontapp.com/#checking-data-integrity
 * @param {object} req
 * @return {boolean}
 */
module.exports.isValidRequest = function (req) {
  const clientOptions = config.clientOptions;
  if (clientOptions.validationDisabled) {
    return true;
  }

  const signature = req.headers[clientOptions.signatureHeader];
  if (!signature) {
    return false;
  }

  const cryptoOptions = config.cryptoOptions;
  const hash = crypto.createHmac(cryptoOptions.algorithm, clientOptions.apiSecret)
    .update(JSON.stringify(req.body))
    .digest(cryptoOptions.encoding);

  return hash === signature;
};
