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
 * @param {string} platformUserId
 * @param {string} messageText
 * @return {object}
 */
module.exports.getMessagePayload = function (platformUserId, messageText) {
  return {
    sender: {
      handle: platformUserId,
    },
    body: messageText,
  };
};

/**
 * @param {string} platformUserId
 * @param {string} messageText
 * @return {Promise}
 */
module.exports.postMessage = function (platformUserId, messageText) {
  const endpoint = module.exports.getSupportChannelPath();
  const data = module.exports.getMessagePayload(platformUserId, messageText);
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
  const signature = req.headers[clientOptions.signatureHeader];
  if (!signature) {
    return false;
  }

  const hash = crypto.createHmac(config.crypto.algorithm, clientOptions.apiSecret)
    .update(JSON.stringify(req.body))
    .digest(config.crypto.encoding);

  return hash === signature;
};
