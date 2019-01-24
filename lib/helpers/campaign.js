'use strict';

const dateFns = require('date-fns');
const graphql = require('../graphql');

/**
 * @param {Number} campaignId
 * @return {Promise}
 */
async function fetchWebSignupConfirmationByCampaignId(campaignId) {
  const webSignupConfirmations = await graphql.fetchWebSignupConfirmations();

  const campaignWebSignupConfirmations = webSignupConfirmations
    .filter(item => item.campaignId === campaignId);

  return campaignWebSignupConfirmations[0] || null;
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
