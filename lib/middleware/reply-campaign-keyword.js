'use strict';

const Campaigns = require('../../app/models/Campaign');

module.exports = function replySignupKeyword() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    // Check if our incoming message is a keyword to signup for a Campaign.
    return Campaigns.findOne({ keywords: req.body.text.toUpperCase() })
      .then((campaign) => {
        if (! campaign) {
          return next();
        }

        req.campaign = campaign;
        // TODO: Check if user is returning to this Campaign via keyword.
        req.user.postSignupForCampaign(campaign);
        req.reply.type = 'gambitSignupMenuMessage';

        return next();
      });
  };
};
