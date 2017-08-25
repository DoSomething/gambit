'use strict';

const helpers = require('../../helpers');

module.exports = function closedCampaign() {
  return (req, res, next) => {
    const campaign = req.campaign;

    if (campaign.isClosed) {
      return helpers.sendOutboundReplyForCampaign(req, res, campaign, 'campaignClosedMessage');
    }

    return next();
  };
};
