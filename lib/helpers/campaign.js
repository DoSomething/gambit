'use strict';

const gambitCampaigns = require('../gambit-campaigns');
const config = require('../../config/lib/helpers/campaign');

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

module.exports = {
  fetchById,
  isClosedCampaign,
};
