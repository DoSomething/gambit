'use strict';

const helpers = require('../../helpers');

module.exports = function askContinueTemplate() {
  return (req, res) => {
    if (helpers.isGambitCampaignsTemplate(req.lastOutboundTemplate)) {
      return helpers.continueCampaign(req, res);
    }

    // If we're here, we may have a non-Campaign topic set.
    // Set Campaign to update Conversation topic for confirmedCampaign, declinedCampaign macros.
    return req.conversation.setCampaignTopic()
      // TODO: If Conversation.signupStatus is 'declined', we shouldn't keep asking to continue
      // the same Campaign -- send Ask Signup for a random Campaign instead?
      .then(() => helpers.askContinue(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
