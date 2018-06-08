'use strict';

const helpers = require('../../../helpers');

module.exports = function continueConversation() {
  return (req, res) => {
    if (!helpers.request.hasCampaign(req)) {
      return helpers.replies.noCampaign(req, res);
    }

    if (helpers.request.isClosedCampaign(req)) {
      return helpers.replies.campaignClosed(req, res);
    }

    const isLastOutboundAskContinue = helpers.request.isLastOutboundAskContinue(req);
    const isLastOutboundAskSignup = helpers.request.isLastOutboundAskSignup(req);

    // If last outbound is askSignup or askContinue, parse user message as whether we should
    // start or continue the current topic.
    if (isLastOutboundAskSignup || isLastOutboundAskContinue) {
      const isConfirmedTopicMacro = helpers.request.isConfirmedTopicMacro(req);
      const isDeclinedTopicMacro = helpers.request.isDeclinedTopicMacro(req);

      // Parse user response to askSignup template:
      if (isLastOutboundAskSignup) {
        if (isConfirmedTopicMacro) {
          return helpers.replies.confirmedSignup(req, res);
        }
        if (isDeclinedTopicMacro) {
          return helpers.replies.declinedSignup(req, res);
        }
        return helpers.replies.invalidAskSignupResponse(req, res);
      }

      // Parse user response to askContinue template:
      if (isConfirmedTopicMacro) {
        return helpers.replies.confirmedContinue(req, res);
      }
      if (isDeclinedTopicMacro) {
        return helpers.replies.declinedContinue(req, res);
      }
      return helpers.replies.invalidAskContinueResponse(req, res);
    }

    if (helpers.request.isLastOutboundTopicTemplate(req)) {
      return helpers.replies.continueConversation(req, res);
    }

    // If we've made it here, either:
    // -- the last outbound was a quick reply, and hasn't triggered any other quick replies
    // -- the current topic is hardcoded in Rivescript brain like 'random' or 'survey_response'
    // -- we're in a campaign topic, but haven't started saving a topic id to the topic field
    //    instead of the hardcoded 'campaign' topic. This edge case will eventually phase out
    //    over time (or especially if we switch saving campaignId's as Phoenix id strings)
    // Save the conversation topic to the one we've found by via the conversation.campaignId.
    return req.conversation.changeTopic(req.topic)
      // TODO: If Conversation.signupStatus is 'declined', we shouldn't keep asking to continue
      // the same Campaign -- send Ask Signup for a random Campaign instead?
      // If we went that route - we could cycle through all options and end with a final
      // check back in with us later if for something else to do.
      .then(() => helpers.replies.askContinue(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
