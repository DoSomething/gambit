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
      if (campaign.keywords.length === 0) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have keywords.');
      }

      req.outboundTemplate = 'externalSignupMenu';
      req.outboundMessageText = campaign.templates[req.outboundTemplate].rendered;
      if (!req.outboundMessageText) {
        const errorMsg = `Campaign ${req.outboundTemplate} template is undefined.`;
        error = new UnprocessibleEntityError(errorMsg);
        return helpers.sendErrorResponse(res, error);
      }

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
