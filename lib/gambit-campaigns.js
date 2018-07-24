'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');

const logger = require('./logger');
const config = require('../config/lib/gambit-campaigns');

const uri = config.clientOptions.baseUri;
const apiKey = config.clientOptions.apiKey;

/**
 * Executes a GET request to given endpoint with given query.
 *
 * @param {String} endpoint
 * @param {Object} query
 * @return {Promise}
 */
function executeGet(endpoint, query = {}) {
  const url = `${uri}/${endpoint}`;
  logger.debug('gambitCampaigns.get', { url, query: JSON.stringify(query) });

  return superagent.get(url)
    .query(query)
    .set(config.authHeader, apiKey)
    .then(res => res.body);
}

/**
 * Executes a POST request to given endpoint with given data.
 *
 * @param {String} endpoint
 * @param {Object} data
 * @return {Promise}
 */
function executePost(endpoint, data) {
  return superagent
    .post(`${uri}/${endpoint}`)
    .set(config.authHeader, apiKey)
    .send(data)
    .then(res => res.body);
}

/**
 * @param {String} broadcastId
 * @return {Promise}
 */
function fetchBroadcastById(broadcastId) {
  return module.exports.executeGet(`${config.endpoints.broadcasts}/${broadcastId}`)
    .then(res => res.data);
}

/**
 * @param {Object} query
 * @return {Promise}
 */
function fetchBroadcasts(query = {}) {
  return module.exports.executeGet(config.endpoints.broadcasts, query);
}

/**
 * @param {Number} campaignId
 * @return {Promise}
 */
function fetchCampaignById(campaignId) {
  return module.exports.executeGet(`${config.endpoints.campaigns}/${campaignId}`)
    .then(res => res.data);
}

/**
 * @param {Object} query
 * @return {Promise}
 */
function fetchCampaigns(query = {}) {
  return module.exports.executeGet(config.endpoints.campaigns, query);
}

/**
 * @param {Object} query
 * @return {Promise}
 */
function fetchDefaultTopicTriggers(query = {}) {
  return module.exports.executeGet(config.endpoints.defaultTopicTriggers, query);
}

/**
 * @param {String} topicId
 * @return {Promise}
 */
function fetchTopicById(topicId) {
  return module.exports.executeGet(`${config.endpoints.topics}/${topicId}`)
    .then(res => res.data);
}

module.exports = {
  executeGet,
  fetchBroadcastById,
  fetchBroadcasts,
  fetchCampaignById,
  fetchCampaigns,
  fetchDefaultTopicTriggers,
  fetchTopicById,
};

// TODO: move functions below to relevant helpers.

/**
 * TODO: Move this into helpers.campaign
 * @param {object} campaign
 * @return {boolean}
 */
module.exports.isClosedCampaign = function (campaign) {
  return campaign.status === config.closedStatusValue;
};

/**
 * Parse our incoming Express request for expected Gambit Campaigns format.
 * TODO: Move this into helpers.request
 *
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
 * TODO: Move this into helpers.request
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
