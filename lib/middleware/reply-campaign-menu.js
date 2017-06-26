'use strict';

const Campaigns = require('../../app/models/Campaign');
const helpers = require('../helpers.js');

module.exports = function replyCampaignMenu() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    // If current user is already in a campaign:
    if (req.user.topic.includes('campaign')) {
      // And they haven't sent in the Menu command:
      if (! helpers.isMenuCommand(req.body.text)) {
        return next();
      }
    }

    // For now, find a random Campaign to prompt for Signup.
    // Eventually query Signups to find Campaigns that are new to User, within their interests, etc.
    return Campaigns.getRandomCampaign()
      .then((campaign) => {
        req.campaign = campaign;
        req.user.promptSignupForCampaign(campaign);
        req.reply.type = 'signupPromptMessage';

        return next();
      });
  };
};
