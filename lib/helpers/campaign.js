'use strict';

const dateFns = require('date-fns');

/**
 * Returns whether a given Campaign has ended.
 *
 * @param {Object} campaign
 * @return {Boolean}
 */
function isClosedCampaign(campaign) {
  return campaign.endDate && dateFns.isPast(dateFns.parse(campaign.endDate));
}

module.exports = {
  isClosedCampaign,
};
