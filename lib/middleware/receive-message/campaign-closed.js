'use strict';

const helpers = require('../../helpers');

module.exports = function closedCampaign() {
  return (req, res, next) => {
    if (!req.campaign) {
      return next();
    }

    if (req.campaign.isClosed) {
      return helpers.campaignClosed(req, res);
    }

    return next();
  };
};
