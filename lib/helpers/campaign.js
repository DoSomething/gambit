'use strict';

const dateFns = require('date-fns');
const graphql = require('../graphql');
const logger = require('../logger');
const cache = require('./cache').webSignupConfirmations;

/**
 * @return {Promise}
 */
async function fetchWebSignupConfirmations() {
  return cache.set(await graphql.fetchWebSignupConfirmations());
}

/**
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
 * @param {Number} campaignId
 * @return {Promise}
 */
async function getWebSignupConfirmationByCampaignId(campaignId) {
  const res = await module.exports.getWebSignupConfirmations();
  return res.find(item => item.campaign.id === campaignId);
}

/**
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
