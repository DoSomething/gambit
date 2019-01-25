'use strict';

const dateFns = require('date-fns');
const graphql = require('../graphql');

/**
 * @param {Number} campaignId
 * @return {Promise}
 */
async function fetchWebSignupConfirmationByCampaignId(campaignId) {
  const res = await graphql.fetchWebSignupConfirmations();

  return res.find(item => item.campaignId === campaignId);
}

/**
 * @param {Object} campaign
 * @return {Boolean}
 */
function isClosedCampaign(campaign) {
  return campaign.endDate && dateFns.isPast(dateFns.parse(campaign.endDate));
}

module.exports = {
  fetchWebSignupConfirmationByCampaignId,
  isClosedCampaign,
};
