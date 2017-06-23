'use strict';

const Campaigns = require('../../app/models/Campaign');
const helpers = require('../helpers.js');

module.exports = function replySignupMenu() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    // If user is already in a Campaign Topic and didn't send a menu keyword, we should continue
    // the Signup conversation and exit.
    if (req.user.hasCampaignTopic() && req.body.text !== 'menu') {
      return next();
    }

    // For now, find a random Campaign to prompt for Signup.
    return Campaigns.getRandomCampaign()
      .then(campaign => helpers.promptSignup(req.user, campaign))
      .then((message) => {
        req.reply.text = message;

        return next();
      });
  };
};
