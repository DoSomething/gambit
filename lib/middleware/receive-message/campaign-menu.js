'use strict';

const Campaigns = require('../../../app/models/Campaign');
const helpers = require('../../helpers.js');

module.exports = function campaignMenu() {
  return (req, res, next) => {
    if (!helpers.isMenuCommand(req.userCommand)) {
      return next();
    }

    let campaign;
    // Find a random Campaign to prompt for Signup.
    // Eventually query Signups to find Campaigns that are new to User, within their interests, etc.
    return Campaigns.findRandomCampaignNotEqualTo(req.conversation.campaignId)
      .then((randomCampaign) => {
        campaign = randomCampaign;
        req.keyword = 'menu';

        return req.conversation.setCampaign(campaign);
      })
      .then(() => helpers.sendReplyWithCampaignTemplate(req, res, 'askSignupMessage'))
      .catch(err => helpers.sendResponseForError(req, res, err));
  };
};
