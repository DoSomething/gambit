'use strict';

const crypto = require('crypto');
const superagent = require('superagent');
const logger = require('heroku-logger');
const config = require('../config/lib/front');

const authString = `Bearer ${config.clientOptions.apiToken}`;

module.exports.get = function (uri) {
  return superagent
    .get(uri)
    .set('Authorization', authString);
};

function post(endpoint, data) {
  return superagent
    .post(`${config.clientOptions.baseUri}/${endpoint}`)
    .set('Authorization', authString)
    .send(data);
}

/**
 * @param {string} senderHandle
 * @param {string} messageText
 */
module.exports.postMessage = function (senderHandle, messageText) {
  const endpoint = `channels/${config.channels.support}/incoming_messages`;
  logger.debug('front.postMessage', { endpoint });
  const data = {
    sender: {
      handle: senderHandle,
    },
    body: messageText,
  };
  logger.debug('front.postMessage', data);

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
