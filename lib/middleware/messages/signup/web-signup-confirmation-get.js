'use strict';

const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function getWebSignupConfirmation() {
  return async (req, res, next) => {
    try {
      const template = await helpers.campaign.getWebSignupConfirmationByCampaignId(req.campaignId);

      /**
       * Note: Blink currently forwards all signup created events to this endpoint, regardless of
       * whether the signup campaign is configured to send a SMS confirmation.
       * If the campaign is not configured to send one, we respond with a 204 instead of a 422 to
       * avoid false alarms in New Relic error reporting. This logic may be revisited if we alter
       * Blink to check if campaign has a config.templates.webSignup before making this request.
       * @see https://github.com/DoSomething/gambit-conversations/pull/423#pullrequestreview-167440897
       */
      if (!template) {
        helpers.addBlinkSuppressHeaders(res);
        return helpers.response.sendNoContent(res, 'Web signup confirmation not found.');
      }

      //  This sanity check is useful if importing signups from campaigns that have ended.
      if (helpers.campaign.isClosedCampaign(template.campaign)) {
        return helpers.sendErrorResponse(res, new UnprocessableEntityError('Campaign has ended.'));
      }

      helpers.request.setOutboundMessageText(req, template.text);
      helpers.request.setTopic(req, template.topic);

      return next();
    } catch (err) {
      return helpers.sendErrorResponse(res, err);
    }
  };
};
