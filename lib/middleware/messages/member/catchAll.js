'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function catchAllMacro() {
  return async (req, res) => {
    if (!helpers.request.hasCampaign(req)) {
      return helpers.replies.noCampaign(req, res);
    }

    if (helpers.request.isClosedCampaign(req)) {
      return helpers.replies.campaignClosed(req, res);
    }

    if (helpers.request.isLastOutboundAskContinue(req)) {
      try {
        await helpers.request.parseAskYesNoResponse(req);
      } catch (err) {
        return helpers.sendErrorResponse(res, err);
      }

      if (helpers.request.isSaidYesMacro(req)) {
        return helpers.replies.confirmedContinue(req, res);
      } else if (helpers.request.isSaidNoMacro(req)) {
        return helpers.replies.declinedContinue(req, res);
      }
      return helpers.replies.invalidAskContinueResponse(req, res);
    }

    // If the previous reply was a topic template and we've made it this far (no triggers have been
    // caught, user is continuing the current topic.
    if (helpers.request.isLastOutboundTopicTemplate(req)) {
      return helpers.replies.continueTopic(req, res);
    }

    // If we're in the default topic, change topic to the one we found via campaignId, and ask
    // user if they would like to continue.
    if (helpers.topic.isDefaultTopicId(req.currentTopicId)) {
      logger.debug('catchAll changeTopic', { from: req.currentTopicId, to: req.topic.id }, req);
      return helpers.request.changeTopic(req, req.topic)
        .then(() => helpers.replies.askContinue(req, res))
        .catch(err => helpers.sendErrorResponse(res, err));
    }

    // If we're here -- the current topic has templates to reply with, but the previous message the
    // user sent was caught by a default topic trigger. Ask user if they'd like to continue the
    // current topic.
    return helpers.replies.askContinue(req, res);
  };
};
