'use strict';

const gambitCampaigns = require('../../gambit-campaigns');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');
const helpers = require('../../helpers');

module.exports = function sendCampaignTemplate() {
  return (req, res, next) => {
    if (req.outboundTemplate === 'support') {
      return next();
    }

    return gambitCampaigns.getCampaignById(req.campaignId)
      .then((campaign) => {
        if (!campaign) {
          return helpers.sendResponseWithStatusCode(req, res, 404, 'Campaign not found.');
        }
        if (gambitCampaigns.isClosedCampaign(campaign)) {
          const err = new UnprocessibleEntityError('Campaign is closed.');
          return helpers.sendErrorResponse(req, res, err);
        }
        if (campaign.keywords.length === 0) {
          helpers.addBlinkSuppressHeaders(res);
          return helpers.sendResponseWithStatusCode(req, res, 204, 'Campaign does not have keywords.');
        }

        req.outboundMessageText = campaign.templates[req.outboundTemplate].rendered;
        if (!req.outboundMessageText) {
          const err = new UnprocessibleEntityError('Campaign template undefined.');
          return helpers.sendErrorResponse(req, res, err);
        }

        return req.conversation.setCampaign(campaign)
          .then(() => next())
          .catch(err => helpers.sendErrorResponse(req, res, err));
      })
      .catch(err => helpers.sendErrorResponse(req, res, err));
  };
};
