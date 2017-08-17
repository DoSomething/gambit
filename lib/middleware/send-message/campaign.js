'use strict';

const Campaigns = require('../../../app/models/Campaign');
const helpers = require('../../helpers');

module.exports = function sendCampaignMessage() {
  return (req, res, next) => {
    Campaigns.findById(req.campaignId)
      .then((campaign) => {
        if (!campaign) {
          return helpers.sendResponseWithStatusCode(res, 404, 'Campaign not found.');
        }
        // If Campaign is closed, send error.

        req.conversation.setCampaign(campaign);
        req.outboundTemplate = req.body.template;
        req.sendMessageText = campaign[req.outboundTemplate];

        return next();
      });
  };
};
