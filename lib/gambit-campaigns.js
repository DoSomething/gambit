'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');

const logger = require('./logger');
const config = require('../config/lib/gambit-campaigns');

const uri = config.clientOptions.baseUri;
const apiKey = config.clientOptions.apiKey;

/**
 * Executes a GET request to given Gambit Campaigns endpoint.
 * @param {string} endpoint
 * @return {Promise}
 */
function executeGet(endpoint) {
  const url = `${uri}/${endpoint}`;
  logger.debug('gambitCampaigns.get', { url });

  return superagent.get(url)
    .then(res => res.body.data)
    .catch(err => Promise.reject(err));
}

/**
 * Executes a POST request to given Gambit Campaigns endpoint with given data.
 * @param {string} endpoint
 * @param {object} data
 * @return {Promise}
 */
function executePost(endpoint, data) {
  return superagent
    .post(`${uri}/${endpoint}`)
    .set('x-gambit-api-key', apiKey)
    .send(data)
    .then(res => res.body)
    .catch(err => Promise.reject(err));
}

/**
 * @param {String} broadcastId
 * @return {Promise}
 */
function fetchBroadcastById(broadcastId) {
  return module.exports.executeGet(`${config.endpoints.broadcasts}/${broadcastId}`);
}

/**
 * @return {Promise}
 */
function fetchBroadcasts() {
  return module.exports.executeGet(config.endpoints.broadcasts);
}

module.exports = {
  executeGet,
  fetchBroadcastById,
  fetchBroadcasts,
};

// TODO: Refactor/move functions below to use config.endpoints and define via module.exports above.

/**
 * @return {Promise}
 */
module.exports.fetchCampaigns = function () {
  return executeGet('campaigns');
};

/**
 * @return {Promise}
 */
module.exports.fetchDefaultTopicTriggers = function () {
  return executeGet('defaultTopicTriggers');
};

/**
 * @return {Promise}
 */
module.exports.fetchTopics = function () {
  return executeGet('topics');
};

/**
 * @param {object} campaign
 * @return {boolean}
 */
module.exports.isClosedCampaign = function (campaign) {
  return campaign.status === config.closedStatusValue;
};

/**
 * Parse our incoming Express request for expected Gambit Campaigns format.
 * @param {object} req
 * @return {object}
 */
function getCampaignActivityPayloadFromReq(req) {
  const data = {
    userId: req.userId,
    campaignId: req.campaign.id,
    campaignRunId: req.campaign.currentCampaignRun.id,
    postType: req.topic.postType,
    text: req.inboundMessageText,
    mediaUrl: req.mediaUrl,
    broadcastId: req.broadcastId,
    platform: req.platform,
  };
  if (req.keyword) {
    data.keyword = req.keyword.toLowerCase();
  }

  return data;
}

/**
 * Posts campaign activity to Gambit Campaigns.
 */
module.exports.postCampaignActivity = function (req) {
  const data = getCampaignActivityPayloadFromReq(req);
  const loggerMessage = 'gambitCampaigns.postCampaignActivity';
  logger.debug(loggerMessage, data, req);

  return new Promise((resolve, reject) => {
    executePost('campaignActivity', data)
      .then((res) => {
        logger.debug(`${loggerMessage} response`, res.data, req);
        return resolve(res.data);
      })
      .catch(err => reject(err));
  });
};

/**
 * @param {Number} campaignId
 * @return {Promise}
 */
module.exports.fetchCampaignById = function fetchCampaignById(campaignId) {
  return executeGet(`campaigns/${campaignId}`);
};

/**
 * @param {String} topicId
 * @return {Promise}
 */
module.exports.fetchTopicById = function fetchTopicById(topicId) {
  return executeGet(`topics/${topicId}`);
};
