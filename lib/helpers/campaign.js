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
 * @return {Boolean}
 */
function isClosedCampaign(campaign) {
  return campaign.status === 'closed';
}

/**
 * TODO: This is probably deprecated at this point?
 *
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
function getWebSignupMessageTemplateNameFromCampaign(campaign) {
  const postType = module.exports.getPostTypeFromCampaign(campaign);
  return config.signupMessageTemplateNamesByPostType[postType];
}

module.exports = {
  fetchById,
  getPostTypeFromCampaign,
  getWebSignupMessageTemplateNameFromCampaign,
  isClosedCampaign,
};
