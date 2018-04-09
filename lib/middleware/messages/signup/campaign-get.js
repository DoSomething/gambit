'use strict';

const gambitCampaigns = require('../../../gambit-campaigns');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');
const helpers = require('../../../helpers');

module.exports = function getCampaign() {
  return (req, res, next) => gambitCampaigns.getCampaignById(req.campaignId)
    .then((campaign) => {
      req.campaign = campaign;
      // These are sanity checks. We shouldn't ever receive a Signup with Campaign not found.
      if (!campaign) {
        return helpers.sendResponseWithStatusCode(res, 404, 'Campaign not found.');
      }
      // Or for a closed Campaign.
      if (gambitCampaigns.isClosedCampaign(campaign)) {
        return helpers.sendErrorResponse(res, new UnprocessibleEntityError('Campaign is closed.'));
      }

      // All Signups get forwarded to this route. If a Campaign doesn't have keywords, we don't
      // want to send a confirmation message for this Signup, as a User wouldn't be able to return
      // back to the Campaign.
      if (!gambitCampaigns.hasKeywords(campaign)) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have keywords.');
      }

      // TODO: Move hardcoded template param into middleware config.
      helpers.request.setOutboundMessageTemplate(req, 'externalSignupMenu');

      try {
        const outboundMessageText = gambitCampaigns
          .getMessageTextFromMessageTemplate(campaign, req.outboundMessageTemplate);
        helpers.request.setOutboundMessageText(req, outboundMessageText);
      } catch (err) {
        return helpers.sendErrorResponse(res, err);
      }

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
