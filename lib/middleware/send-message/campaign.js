'use strict';

const Campaign = require('../../../app/models/Campaign');
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

    return Campaign.findById(req.campaignId)
      .then((campaign) => {
        if (!campaign) {
          return helpers.sendResponseWithStatusCode(res, 404, 'Campaign not found.');
        }
        if (campaign.isClosed) {
          const err = new UnprocessibleEntityError('Campaign is closed.');
          return helpers.sendErrorResponse(res, err);
        }

        req.messageText = campaign.templates[req.outboundTemplate];
        if (!req.messageText) {
          const err = new UnprocessibleEntityError('Campaign template undefined.');
          return helpers.sendErrorResponse(res, err);
        }

        return req.conversation.setCampaign(campaign)
          .then(() => next())
          .catch(err => helpers.sendErrorResponse(res, err));
      });
  };
};
