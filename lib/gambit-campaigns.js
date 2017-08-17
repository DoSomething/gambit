'use strict';

const superagent = require('superagent');
const logger = require('heroku-logger');

const uri = process.env.DS_GAMBIT_CAMPAIGNS_API_BASEURI;
const apiKey = process.env.DS_GAMBIT_CAMPAIGNS_API_KEY;

module.exports.get = function (endpoint) {
  return superagent
    .get(`${uri}/${endpoint}`)
    .then(response => response.body.data)
    .catch((/* err */) => {
      // TODO console.log has to be replaced by other development logging library: Winston?
      // console.log(`gambit response:${err.message}`);
    });
};

module.exports.post = function (endpoint, data) {
  return superagent
    .post(`${uri}/${endpoint}`)
    .set('x-gambit-api-key', apiKey)
    .send(data)
    .then(response => response.body)
    .catch(err => logger.error(err));
};

module.exports.postSignupMessage = function (data) {
  logger.debug('gambit.postSignupMessage', data);

  return this.post('receive-message', data)
    .then(res => res.success.message)
    .catch(err => err.message);
};
