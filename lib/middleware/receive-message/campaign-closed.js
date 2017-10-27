'use strict';

const helpers = require('../../helpers');
const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function closedCampaign() {
  return (req, res, next) => {
    if (!req.campaign) {
      return next();
    }

    // Check if User's current Campaign has closed.
    if (gambitCampaigns.isClosedCampaign(req.campaign)) {
      return helpers.campaignClosed(req, res);
    }

    return next();
  };
};
