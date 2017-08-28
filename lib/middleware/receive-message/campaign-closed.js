'use strict';

const helpers = require('../../helpers');

module.exports = function closedCampaign() {
  return (req, res, next) => {
    if (!req.campaign.isClosed) {
      return next();
    }

    return helpers.sendReplyWithCampaignTemplate(req, res, 'campaignClosedMessage');
  };
};
