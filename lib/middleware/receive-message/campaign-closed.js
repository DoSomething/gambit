'use strict';

const helpers = require('../../helpers');
const gambitCampaigns = require('../../gambit-campaigns');

module.exports = function closedCampaign() {
  return (req, res, next) => {
    if (!req.campaign) {
      return next();
    }

    if (!gambitCampaigns.isActiveCampaign(req.campaign)) {
      return helpers.campaignClosed(req, res);
    }

    return next();
  };
};
