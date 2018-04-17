'use strict';

const config = require('../../config/lib/helpers/campaign');

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
  getPostTypeFromCampaign,
  getSignupMessageTemplateNameFromCampaign,
};
