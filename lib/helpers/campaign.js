'use strict';

const dateFns = require('date-fns');
const gambitContent = require('../gambit-content');

/**
 * @param {Number} campaignId
 * @return {String}
 */
function fetchById(campaignId) {
  return gambitContent.fetchCampaignById(campaignId);
}

/**
 * @param {Object} campaign
 * @return {Boolean}
 */
function isClosedCampaign(campaign) {
  return campaign.endDate && dateFns.isPast(dateFns.parse(campaign.endDate));
}

module.exports = {
  fetchById,
  isClosedCampaign,
};
