'use strict';

const dateFns = require('date-fns');
const graphql = require('../graphql');
const logger = require('../logger');
const cache = require('./cache').webSignupConfirmations;

/**
 * Fetches all WebSignupConfirmations from GraphQL and caches the result.
 *
 * @return {Promise}
 */
async function fetchWebSignupConfirmations() {
  try {
    const res = await graphql.fetchWebSignupConfirmations();
    return cache.set(res);
  } catch (error) {
    throw error;
  }
}

/**
 * Gets all cached WebSignupConfirmations, or fetches if not found.
 *
 * @return {Promise}
 */
async function getWebSignupConfirmations() {
  const res = await cache.get();
  if (res) {
    logger.debug('Cache hit for webSignupConfirmations.');
    return res;
  }

  logger.debug('Cache miss for webSignupConfirmations.');
  return module.exports.fetchWebSignupConfirmations();
}

/**
 * Returns the WebSignupConfirmation for a given campaignId, if it exists.
 *
 * @param {Number} campaignId
 * @return {Promise}
 */
async function getWebSignupConfirmationByCampaignId(campaignId) {
  const res = await module.exports.getWebSignupConfirmations();
  return res.find(item => item.campaign.id === campaignId);
}

/**
 * Returns whether a given Campaign has ended.
 *
 * @param {Object} campaign
 * @return {Boolean}
 */
function isClosedCampaign(campaign) {
  return campaign.endDate && dateFns.isPast(dateFns.parse(campaign.endDate));
}

module.exports = {
  fetchWebSignupConfirmations,
  getWebSignupConfirmationByCampaignId,
  getWebSignupConfirmations,
  isClosedCampaign,
};
