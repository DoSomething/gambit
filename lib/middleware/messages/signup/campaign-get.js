'use strict';

const gambitCampaigns = require('../../../gambit-campaigns');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');
const helpers = require('../../../helpers');

module.exports = function getCampaign() {
  return (req, res, next) => gambitCampaigns.getCampaignById(req.campaignId)
    .then((campaign) => {
      req.campaign = campaign;
      let error;

      // These are sanity checks. We shouldn't ever receive a Signup with Campaign not found.
      if (!campaign) {
        return helpers.sendResponseWithStatusCode(res, 404, 'Campaign not found.');
      }
      // Or for a closed Campaign.
      if (gambitCampaigns.isClosedCampaign(campaign)) {
        error = new UnprocessibleEntityError('Campaign is closed.');
        return helpers.sendErrorResponse(res, error);
      }

      // All Signups get forwarded to this route. If a Campaign doesn't have keywords, we don't
      // want to send a confirmation message for this Signup, as a User wouldn't be able to return
      // back to the Campaign.
      if (!gambitCampaigns.hasKeywords(campaign)) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have keywords.');
      }

      helpers.request.setOutboundMessageTemplate(req, 'externalSignupMenu');
      const outboundMessageText = campaign.templates[req.outboundMessageTemplate].rendered;
      helpers.request.setOutboundMessageText(req, outboundMessageText);
      if (!req.outboundMessageText) {
        const errorMsg = `Campaign ${req.outboundMessageTemplate} template is undefined.`;
        error = new UnprocessibleEntityError(errorMsg);
        return helpers.sendErrorResponse(res, error);
      }

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
