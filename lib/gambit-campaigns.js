'use strict';

const superagent = require('superagent');
const logger = require('./logger');
const config = require('../config/lib/gambit-campaigns');

const apiKey = config.clientOptions.apiKey;

/**
 * @param {String} endpoint
 * @return {String}
 */
function apiUrl(endpoint) {
  return `${config.clientOptions.baseUri}/${endpoint}`;
}

/**
 * Executes a GET request to given endpoint with given query.
 *
 * @param {String} endpoint
 * @param {Object} query
 * @return {Promise}
 */
function executeGet(endpoint, query = {}) {
  logger.debug('gambitCampaigns.get', { endpoint, query: JSON.stringify(query) });

  return superagent
    .get(module.exports.apiUrl(endpoint))
    .set(config.authHeader, apiKey)
    .query(query)
    .then(res => res.body);
}

/**
 * @param {String} broadcastId
 * @param {Object} query
 * @return {Promise}
 */
function fetchBroadcastById(broadcastId, query = {}) {
  return module.exports.executeGet(`${config.endpoints.broadcasts}/${broadcastId}`, query)
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
  apiUrl,
  executeGet,
  fetchBroadcastById,
  fetchBroadcasts,
  fetchCampaignById,
  fetchCampaigns,
  fetchDefaultTopicTriggers,
  fetchTopicById,
};
