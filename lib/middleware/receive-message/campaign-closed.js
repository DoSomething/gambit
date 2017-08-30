'use strict';

const helpers = require('../../helpers');

module.exports = function closedCampaign() {
  return (req, res, next) => {
    if (!req.campaign) {
      return next();
    }

    if (req.campaign.isClosed) {
      return helpers.sendReplyWithCampaignTemplate(req, res, 'campaignClosedMessage');
    }

    return next();
  };
};
