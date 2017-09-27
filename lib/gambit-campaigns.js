'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');
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
    .then(res => res.body)
    .catch(err => err);
};

module.exports.getActiveCampaigns = function () {
  return this.get('campaigns');
};

/**
 * Parse our incoming Express request for expected Gambit Campaigns format.
 * @param {object} req
 * @return {object}
 */
function parseReceiveMessageRequest(req) {
  const data = {
    userId: req.userId,
    campaignId: req.campaign.id,
    text: req.inboundMessageText,
    mediaUrl: req.mediaUrl,
    broadcastId: req.broadcastId,
  };
  if (req.keyword) {
    data.keyword = req.keyword.toLowerCase();
  }

  return data;
}

/**
 * Posts data to the /receive-message endpoint.
 */
module.exports.postReceiveMessage = function (req) {
  const data = parseReceiveMessageRequest(req);
  const loggerMessage = 'gambitCampaigns.postReceiveMessage';
  logger.debug(loggerMessage, data);

  return new Promise((resolve, reject) => {
    this.post('receive-message', data)
      .then((res) => {
        logger.debug(`${loggerMessage} res.success`, res.success);
        return resolve(res.success);
      })
      .catch(err => reject(err));
  });
};
