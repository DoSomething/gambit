'use strict';

const Campaigns = require('../../../app/models/Campaign');
const helpers = require('../../helpers');

module.exports = function sendCampaignTemplate() {
  return (req, res, next) => {
    if (req.outboundTemplate === 'support') {
      return next();
    }

    return Campaigns.findById(req.campaignId)
      .then((campaign) => {
        if (!campaign) {
          return helpers.sendResponseWithStatusCode(res, 404, 'Campaign not found.');
        }
        if (campaign.isClosed) {
          return helpers.sendResponseWithStatusCode(res, 422, 'Campaign is closed.');
        }

        req.sendMessageText = campaign.templates[req.outboundTemplate];
        if (!req.sendMessageText) {
          return helpers.sendResponseWithStatusCode(res, 422, 'Campaign template undefined.');
        }

        return req.conversation.setCampaign(campaign)
          .then(() => next())
          .catch(err => helpers.sendErrorResponse(res, err));
      });
  };
};
