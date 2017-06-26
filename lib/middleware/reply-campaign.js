'use strict';

const Campaigns = require('../../app/models/Campaign');

module.exports = function replyCampaignTopic() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    return Campaigns.findById(req.user.campaignId)
      .then((campaign) => {
        // Handle edge-case where Campaign model isn't found.
        req.campaign = campaign;

        if (req.reply.brain === 'post_signup') {
          req.user.signupForCampaign(campaign, 'menu');
          req.reply.type = 'gambitSignupMenuMessage';

          return next();
        }

        if (req.reply.brain === 'decline_signup') {
          req.user.declineSignup();
          req.reply.type = 'signupDeclinedMessage';

          return next();
        }

        req.reply.type = 'signupConfirmedMessage';

        return next();
      });
  };
};
