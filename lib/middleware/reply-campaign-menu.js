'use strict';

const Campaigns = require('../../app/models/Campaign');
const helpers = require('../helpers.js');

module.exports = function replyCampaignMenu() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    let promptSignup = true;

    // If current user is already in a campaign:
    if (req.user.topic.includes('campaign')) {
      // And it's because they declined it, we want to prompt.
      if (req.user.lastReplyType === 'signupDeclinedMessage') {
        promptSignup = true;
      // Or if they sent the menu command, we also want to prompt.
      } else if (helpers.isMenuCommand(req.userCommand)) {
        promptSignup = true;
      // Otherwise we don't want to prompt.
      } else {
        promptSignup = false;
      }
    }

    if (! promptSignup) {
      return next();
    }

    // Find a random Campaign to prompt for Signup.
    // Eventually query Signups to find Campaigns that are new to User, within their interests, etc.
    return Campaigns.getRandomCampaign()
      .then((campaign) => {
        req.campaign = campaign;
        req.user.setCampaign(campaign);
        req.reply.type = 'signupPromptMessage';

        return next();
      });
  };
};
