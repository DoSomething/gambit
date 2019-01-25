'use strict';

const superagent = require('superagent');
const logger = require('./logger');
const config = require('../config/lib/gambit-content');

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
  logger.debug('gambitContent.get', { endpoint, query: JSON.stringify(query) });

  return superagent
    .get(module.exports.apiUrl(endpoint))
    .set(config.authHeader, apiKey)
    .query(query)
    .then(res => res.body);
}

/**
 * @param {Number} campaignId
 * @return {Promise}
 */
function fetchCampaignById(campaignId) {
  return module.exports.executeGet(`${config.endpoints.campaigns}/${campaignId}`)
    .then(res => res.data);
}

module.exports = {
  apiUrl,
  executeGet,
  fetchCampaignById,
};
