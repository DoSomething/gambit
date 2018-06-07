'use strict';

const helpers = require('../../../helpers');

module.exports = function askContinueTemplate() {
  return (req, res) => {
    if (helpers.template.isGambitCampaignsTemplate(req.lastOutboundTemplate)) {
      return helpers.replies.continueConversation(req, res);
    }

    // If we've made it here, either:
    // -- the current topic is hardcoded in Rivescript brain like 'random' or 'survey_response'
    // -- we're in a campaign topic, but haven't started saving a topic id to the topic field
    //    instead of the hardcoded 'campaign' topic
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
