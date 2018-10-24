'use strict';

const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function getCampaign() {
  return async (req, res, next) => {
    try {
      const campaign = await helpers.campaign.fetchById(req.campaignId);

      // We should never receive a signup request for a closed campaign, but sanity check:
      if (helpers.campaign.isClosedCampaign(campaign)) {
        return helpers.sendErrorResponse(res, new UnprocessableEntityError('Campaign is closed.'));
      }

      /**
       * Note: Blink currently forwards all signup created events to this endpoint, regardless of
       * whether the signup campaign is configured to send a SMS confirmation.
       * If the campaign is not configured to send one, we respond with a 204 instead of a 422 to
       * avoid false alarms in New Relic error reporting. This logic may be revisited if we alter
       * Blink to check if campaign has a config.templates.webSignup before making this request.
       * @see https://github.com/DoSomething/gambit-conversations/pull/423#pullrequestreview-167440897
       */
      if (!campaign.config.id) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.response.sendNoContent(res, 'Campaign does not have a config.');
      }
      const webSignup = campaign.config.templates.webSignup;
      if (!webSignup.text) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.response.sendNoContent(res, 'Campaign does not have a webSignup.');
      }

      helpers.request.setOutboundMessageText(req, webSignup.text);
      helpers.request.setOutboundMessageTemplate(req, webSignup.template);
      helpers.request.setTopic(req, webSignup.topic);

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
