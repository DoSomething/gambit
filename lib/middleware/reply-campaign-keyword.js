'use strict';

const Campaigns = require('../../app/models/Campaign');

module.exports = function replySignupKeyword() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    // Check if our incoming message is a keyword to signup for a Campaign.
    return Campaigns.findOne({ keywords: req.userCommand.toUpperCase() })
      .then((campaign) => {
        if (! campaign) {
          return next();
        }

        req.campaign = campaign;
        req.user.signupForCampaign(campaign, 'keyword', req.userCommand);
        // TODO: Send relevant continue message if User has already started this Campaign.
        req.reply.type = 'gambitSignupMenuMessage';

        return next();
      });
  };
};
