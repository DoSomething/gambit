'use strict';

const superagent = require('superagent');
const logger = require('heroku-logger');

const baseUri = 'https://api2.frontapp.com';
const apiToken = process.env.FRONT_API_TOKEN;

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
 * @param {string} userId
 * @param {Message} message
 */
module.exports.postMessage = function (message) {
  const channel = process.env.FRONT_API_SUPPORT_CHANNEL;

  const endpoint = `channels/${channel}/incoming_messages`;
  const data = {
    sender: {
      handle: message.userId,
    },
    body: message.text,
  };

  return post(endpoint, data);
};
