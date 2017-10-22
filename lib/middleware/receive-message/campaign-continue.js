'use strict';

const helpers = require('../../helpers');

module.exports = function askContinueTemplate() {
  return (req, res) => {
    if (helpers.isGambitCampaignsTemplate(req.lastOutboundTemplate)) {
      return helpers.continueCampaign(req, res);
    }

    // If we're here, we may have a non-Campaign topic set. 
    // Set topic to current Campaign to listen for confirmedCampaign, declinedCampaign macros.
    req.conversation.setTopic('campaign');

    // TODO: If Conversation.signupStatus is 'declined', we shouldn't keep asking to continue
    // the same Campaign -- ask signup for a random Campaign instead?
    return helpers.askContinue(req, res);
  };
};
