'use strict';

const Campaigns = require('../../../app/models/Campaign');
const helpers = require('../../helpers.js');

module.exports = function getCampaignMenu() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    if (! helpers.isMenuCommand(req.userCommand)) {
      return next();
    }

    // Find a random Campaign to prompt for Signup.
    // Eventually query Signups to find Campaigns that are new to User, within their interests, etc.
    return Campaigns.getRandomCampaign()
      .then((campaign) => {
        req.campaign = campaign;
        req.conversation.setCampaign(campaign);
        req.reply.template = 'askSignupMessage';

        return next();
      });
  };
};
