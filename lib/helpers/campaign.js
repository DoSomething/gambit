'use strict';

const dateFns = require('date-fns');

const graphql = require('../graphql');
const logger = require('../logger');
const cache = require('./cache').webSignupConfirmations;

/**
 * Transforms GraphQL response to be compatible with the legacy contract.
 * @param {Topic} confirmation
 */
function webSignupConfirmationTransformer(confirmation) {
  const transformedConfirmation = {};
  /**
   * TODO: topic should be renamed to transition in GraphQL
   * to avoid the confusing topic.topic property
   */
  const transition = confirmation.topic;

  transformedConfirmation.text = null;
  // Campaign info injected using the Rogue schema in GraphQL
  transformedConfirmation.campaign = confirmation.campaign;

  if (transition) {
    transformedConfirmation.text = transition.text;
    transformedConfirmation.topic = transition.topic;
  }

  return transformedConfirmation;
}

/**
 * Fetches all WebSignupConfirmations from GraphQL and caches the result.
 *
 * @return {Promise}
 */
async function fetchWebSignupConfirmations() {
  try {
    const webSignupConfirmations = await graphql.fetchWebSignupConfirmations();
    logger.debug('fetchWebSignupConfirmations success', { count: webSignupConfirmations.length });
    const transformedWebSignupConfirmations = webSignupConfirmations
      .map(module.exports.webSignupConfirmationTransformer);
    return cache.set(transformedWebSignupConfirmations);
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
  webSignupConfirmationTransformer,
};
