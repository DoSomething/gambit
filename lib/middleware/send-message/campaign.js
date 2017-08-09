'use strict';

const Campaigns = require('../../../app/models/Campaign');

module.exports = function sendCampaignMessage() {
  return (req, res, next) => {
    Campaigns.findById(req.body.campaignId)
      .then((campaign) => {
        if (!campaign) {
          // TODO: Send error.
          return next();
        }

        req.conversation.setCampaign(campaign);
        req.outboundTemplate = req.body.template;
        req.sendMessageText = campaign[req.outboundTemplate];

        return next();
      });
  };
};
