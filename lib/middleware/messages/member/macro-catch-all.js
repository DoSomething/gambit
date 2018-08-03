'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');

module.exports = function catchAllMacro() {
  return async (req, res) => {
    if (helpers.request.isAutoReplyTopic(req)) {
      return helpers.replies.autoReply(req, res);
    }

    if (!helpers.request.hasCampaign(req)) {
      return helpers.replies.noCampaign(req, res);
    }

    if (helpers.request.isClosedCampaign(req)) {
      return helpers.replies.campaignClosed(req, res);
    }

    const askedContinue = helpers.request.isLastOutboundAskContinue(req);
    const askedSignup = helpers.request.isLastOutboundAskSignup(req);
    if (askedSignup || askedContinue) {
      try {
        // Check if inbound message should execute saidYes or saidNo macros.
        await helpers.request.parseAskYesNoResponse(req);
      } catch (err) {
        return helpers.sendErrorResponse(res, err);
      }

      if (helpers.request.isSaidYesMacro(req)) {
        if (askedSignup) {
          return helpers.replies.confirmedSignup(req, res);
        }
        return helpers.replies.confirmedContinue(req, res);
      }

      if (helpers.request.isSaidNoMacro(req)) {
        if (askedSignup) {
          return helpers.replies.declinedSignup(req, res);
        }
        return helpers.replies.declinedContinue(req, res);
      }

      if (askedSignup) {
        return helpers.replies.invalidAskSignupResponse(req, res);
      }
      return helpers.replies.invalidAskContinueResponse(req, res);
    }

    if (helpers.request.isLastOutboundTopicTemplate(req)) {
      return helpers.replies.continueTopic(req, res);
    }

    // If current topic isn't hardcoded, current topic has templates but user's previous message
    // was a Rivescript reply sent from a default topic trigger. Because we've already checked to
    // make sure we're not in an autoReply topic, we can prompt user if they'd like to continue
    // the current topic.
    if (!helpers.request.isRivescriptCurrentTopic(req)) {
      return helpers.replies.askContinue(req, res);
    }
    // If we're here -- it should be because the current topic has been set to 'random' via the
    // hardcoded Rivescript topics.
    logger.debug('catchAll changeTopic', { from: req.conversation.topic, to: req.topic.id }, req);
    return helpers.request.changeTopic(req, req.topic)
      .then(() => helpers.replies.askContinue(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
