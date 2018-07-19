'use strict';

const lodash = require('lodash');
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
 * @param {Number} campaignId
 * @return {Promise}
 */
function fetchRandomCampaignExcludingCampaignId(campaignId) {
  return module.exports.fetchAllActive()
    .then((activeCampaigns) => {
      // Remove our given campaignId from the list of active campaign id's.
      const filteredCampaigns = activeCampaigns.filter(campaign => campaign.id !== campaignId);
      // Fetch a random campaign from the filtered list.
      const randomCampaign = lodash.sample(filteredCampaigns);
      // The campaigns index response doesn't render return templates, fetch templates from
      // a single campaigns response.
      return module.exports.fetchById(randomCampaign.id);
    });
}

/**
 * @param {Object} campaign
 * @return {Boolean}
 */
function isClosedCampaign(campaign) {
  // TODO: Move isClosedCampaign config out of gambitCampaigns and into this helper.
  return gambitCampaigns.isClosedCampaign(campaign);
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
  fetchRandomCampaignExcludingCampaignId,
  getPostTypeFromCampaign,
  getWebSignupMessageTemplateNameFromCampaign,
  isClosedCampaign,
};
