'use strict';

const superagent = require('superagent');
const logger = require('heroku-logger');

const uri = process.env.DS_GAMBIT_API_BASEURI;
const apiKey = process.env.DS_GAMBIT_API_KEY;

module.exports.get = function (endpoint) {
  return superagent
    .get(`${uri}/${endpoint}`)
    .then(response => response.body.data)
    .catch(err => console.log(`gambit response:${err.message}`));
};

module.exports.post = function (endpoint, data) {
  return superagent
    .post(`${uri}/${endpoint}`)
    .set('x-gambit-api-key', apiKey)
    .send(data)
    .then(response => response.body)
    .catch(err => console.log(`gambit response:${err.message}`));
};

module.exports.getGambitReply = function (userId, messageText, keyword) {
  const data = {
    phone: '201706271241',
    args: messageText,
    keyword,
  };
  logger.debug('gambit.getGambitReply', data);

  return this.post('chatbot', data)
    .then(res => res.success.message)
    .catch(err => console.log(err));
};
