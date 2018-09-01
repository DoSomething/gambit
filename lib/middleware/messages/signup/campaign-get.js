'use strict';

const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function getCampaign() {
  return (req, res, next) => helpers.campaign.fetchById(req.campaignId)
    .then((campaign) => {
      const webSignup = campaign.config.templates.webSignup;
      if (!webSignup.text) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have a webSignup.');
      }
      helpers.request.setOutboundMessageText(req, webSignup.text);
      helpers.request.setOutboundMessageTemplate(req, 'webSignup');
      helpers.request.setTopic(req, webSignup.topic);
      // We should never receive a signup request for a closed campaign, but sanity check:
      if (helpers.request.isClosedCampaign(req)) {
        return helpers.sendErrorResponse(res, new UnprocessibleEntityError('Campaign is closed.'));
      }
      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
