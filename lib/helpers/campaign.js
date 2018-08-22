'use strict';

const gambitCampaigns = require('../gambit-campaigns');
const config = require('../../config/lib/helpers/campaign');

function fetchAllActive() {
  return gambitCampaigns.fetchCampaigns()
    .then(res => res.data.filter(campaign => !module.exports.isClosedCampaign(campaign)));
}

/**
 * @param {Number} campaignId
 * @return {String}
 */
function fetchById(campaignId) {
  return gambitCampaigns.fetchCampaignById(campaignId);
}

/**
 * @param {Object} campaign
 * @return {Boolean}
 */
function isClosedCampaign(campaign) {
  return campaign.status === config.statuses.closed;
}

/**
 * @param {Object} campaign
 * @return {String}
 */
function getPostTypeFromCampaign(campaign) {
  if (!campaign.topics.length) {
    return null;
  }
  return campaign.topics[0].postType;
}

/**
 * @param {Object} campaign
 * @return {String}
 */
function getWebSignupMessageTemplateNameFromCampaign(campaign) {
  const postType = module.exports.getPostTypeFromCampaign(campaign);
  return config.signupMessageTemplateNamesByPostType[postType];
}

module.exports = {
  fetchAllActive,
  fetchById,
  getPostTypeFromCampaign,
  getWebSignupMessageTemplateNameFromCampaign,
  isClosedCampaign,
};
