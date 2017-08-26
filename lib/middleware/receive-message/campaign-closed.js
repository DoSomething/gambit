'use strict';

const helpers = require('../../helpers');

module.exports = function closedCampaign() {
  return (req, res, next) => {
    if (!req.campaign.isClosed) {
      return next();
    }

    return helpers.sendOutboundReplyForCampaign(req, res, req.campaign, 'campaignClosedMessage');
  };
};
