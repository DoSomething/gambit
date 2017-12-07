'use strict';

const helpers = require('../../helpers.js');
const gambitCampaigns = require('../../gambit-campaigns.js');

module.exports = function campaignMenu() {
  return (req, res, next) => {
    if (!helpers.macro.isCampaignMenu(req.macro)) {
      return next();
    }

    // Find a random Campaign to prompt for Signup.
    // Eventually query Signups to find Campaigns that are new to User, within their interests, etc.
    return gambitCampaigns.getRandomActiveCampaignNotEqualTo(req.conversation.campaignId)
      .then((randomCampaign) => {
        req.campaign = randomCampaign;

        return req.conversation.setCampaign(randomCampaign);
      })
      .then(() => helpers.replies.askSignup(req, res))
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
