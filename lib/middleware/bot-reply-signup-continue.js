'use strict';

const Campaigns = require('../../app/models/Campaign');
const helpers = require('../helpers.js');

module.exports = function replySignupMenu() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    return Campaigns.findById(req.user.campaignId)
      .then((campaign) => {
        if (req.reply.rivescript === 'post_signup') {
          return helpers.postSignup(req.user, campaign);
        }

        if (req.reply.rivescript === 'decline_signup') {
          return helpers.declineSignup(req.user, campaign);
        }

        return campaign.getSignupConfirmedMessage();
      })
      .then((messageText) => {
        req.reply.text = messageText;
        return next();
      });
  };
};
