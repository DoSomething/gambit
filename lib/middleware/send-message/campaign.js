'use strict';

const gambitCampaigns = require('../../gambit-campaigns');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');
const helpers = require('../../helpers');

module.exports = function sendCampaignTemplate() {
  return (req, res, next) => {
    if (req.outboundTemplate === 'support') {
      return next();
    }

    if (req.conversation.paused) {
      const err = new UnprocessibleEntityError('Conversation is paused.');
      return helpers.sendErrorResponse(res, err);
    }

    return gambitCampaigns.getCampaignById(req.campaignId)
      .then((campaign) => {
        if (!campaign) {
          return helpers.sendResponseWithStatusCode(res, 404, 'Campaign not found.');
        }
        if (campaign.isClosed) {
          const err = new UnprocessibleEntityError('Campaign is closed.');
          return helpers.sendErrorResponse(res, err);
        }

        req.outboundMessageText = campaign.templates[req.outboundTemplate].rendered;
        if (!req.outboundMessageText) {
          const err = new UnprocessibleEntityError('Campaign template undefined.');
          return helpers.sendErrorResponse(res, err);
        }

        return req.conversation.setCampaign(campaign)
          .then(() => next())
          .catch(err => helpers.sendErrorResponse(res, err));
      });
  };
};
