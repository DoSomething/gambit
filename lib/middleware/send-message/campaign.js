'use strict';

const Campaigns = require('../../../app/models/Campaign');
const helpers = require('../../helpers');

module.exports = function sendCampaignMessage() {
  return (req, res, next) => {
    if (req.outboundTemplate === 'support') {
      return next();
    }

    return Campaigns.findById(req.campaignId)
      .then((campaign) => {
        if (!campaign) {
          return helpers.sendResponseWithStatusCode(res, 404, 'Campaign not found.');
        }
        // TODO: If Campaign is closed, send error.

        req.conversation.setCampaign(campaign);
        req.sendMessageText = campaign[req.outboundTemplate];

        return next();
      });
  };
};
