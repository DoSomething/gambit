'use strict';

const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function getCampaign() {
  return (req, res, next) => helpers.campaign.fetchById(req.campaignId)
    .then((campaign) => {
      // We should never receive a signup request for a closed campaign, but sanity check:
      if (helpers.campaign.isClosedCampaign(campaign)) {
        return helpers.sendErrorResponse(res, new UnprocessableEntityError('Campaign is closed.'));
      }
      if (!campaign.config.id) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have a config.');
      }
      const webSignup = campaign.config.templates.webSignup;
      if (!webSignup.text) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.sendResponseWithStatusCode(res, 204, 'Campaign does not have a webSignup.');
      }

      helpers.request.setOutboundMessageText(req, webSignup.text);
      helpers.request.setOutboundMessageTemplate(req, webSignup.template);
      helpers.request.setTopic(req, webSignup.topic);

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
