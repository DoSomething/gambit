'use strict';

const superagent = require('superagent');
const logger = require('heroku-logger');
const config = require('../config/lib/front');

const baseUri = config.clientOptions.baseUri;
const apiToken = config.clientOptions.apiToken;

module.exports.get = function (uri) {
  return superagent
    .get(uri)
    .set('Authorization', `Bearer ${apiToken}`)
    .then(res => res.body)
    .catch(err => logger.error('front.get', err));
};

function post(endpoint, data) {
  return superagent
    .post(`${baseUri}/${endpoint}`)
    .set('Authorization', `Bearer ${apiToken}`)
    .send(data)
    .then(res => res.body)
    .catch(err => logger.error('front.post', err));
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
