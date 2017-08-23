'use strict';

const superagent = require('superagent');
const logger = require('heroku-logger');

const uri = process.env.DS_GAMBIT_CAMPAIGNS_API_BASEURI;
const apiKey = process.env.DS_GAMBIT_CAMPAIGNS_API_KEY;

module.exports.get = function (endpoint) {
  const url = `${uri}/${endpoint}`;
  logger.trace('gambitCampaigns.get', { url });

  return superagent.get(url)
    .then(res => res.body.data)
    .catch(err => err);
};

module.exports.post = function (endpoint, data) {
  return superagent
    .post(`${uri}/${endpoint}`)
    .set('x-gambit-api-key', apiKey)
    .send(data)
    .then(response => response.body)
    .catch(err => logger.error(err));
};

module.exports.getActiveCampaigns = function () {
  return this.get('campaigns');
};

module.exports.postSignupMessage = function (data) {
  logger.debug('gambit.postSignupMessage', data);

  return this.post('receive-message', data)
    .then(res => res.success.message)
    .catch(err => err.message);
};
