'use strict';

const gambitCampaigns = require('../gambit-campaigns');
const config = require('../../config/lib/helpers/campaign');

/**
 * @param {Number} campaignId
 * @return {String}
 */
function fetchById(campaignId) {
  return gambitCampaigns.getCampaignById(campaignId);
}

/**
 * @param {Object} campaign
 * @return {String}
 */
function getPostTypeFromCampaign(campaign) {
  return campaign.botConfig.postType;
}

/**
 * @param {Object} campaign
 * @return {String}
 */
function getSignupMessageTemplateNameFromCampaign(campaign) {
  const postType = module.exports.getPostTypeFromCampaign(campaign);
  return config.signupMessageTemplateNamesByPostType[postType];
}

module.exports = {
  fetchById,
  getPostTypeFromCampaign,
  getSignupMessageTemplateNameFromCampaign,
};
