'use strict';

const gambitCampaigns = require('../../../gambit-campaigns');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');
const helpers = require('../../../helpers');

module.exports = function validateCampaign() {
  return (req, res, next) => {
    if (gambitCampaigns.isClosedCampaign(req.campaign)) {
      return helpers.sendErrorResponse(res, new UnprocessibleEntityError('Campaign is closed.'));
    }

    // All Signups get forwarded to this route. If a Campaign doesn't have keywords, we don't
    // want to send a confirmation message for this Signup, as a User wouldn't be able to return
    // back to the Campaign.
    if (!gambitCampaigns.hasKeywords(req.campaign)) {
      helpers.addBlinkSuppressHeaders(res);
      return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have keywords.');
    }

    return next();
  };
};
