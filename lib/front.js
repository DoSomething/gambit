'use strict';

const superagent = require('superagent');
const logger = require('heroku-logger');

const uri = 'https://api2.frontapp.com';
const apiToken = process.env.FRONT_API_TOKEN;

function post(endpoint, data) {
  return superagent
    .post(`${uri}/${endpoint}`)
    .set('Authorization', `Bearer ${apiToken}`)
    .send(data)
    .then(res => res.body)
    .catch(err => logger.error('front.post', err));
}

/**
 * @param {string} userId
 * @param {string} messageText
 */
module.exports.postMessage = function (userId, messageText) {
  const endpoint = 'channels/cha_290x/incoming_messages';
  const data = {
    sender: {
      handle: userId,
    },
    body: messageText,
  };

  return post(endpoint, data);
};

/**
 * Parses a Front POST body request to our send-message endpoint.
 */
module.exports.parseOutgoingMessage = function (req) {
  const payload = req.body;

  return {
    text: payload.text,
    recipients: payload.recipients,
  };
}
