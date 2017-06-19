'use strict';

const Campaigns = require('../../app/models/Campaign');
const helpers = require('../helpers.js');

module.exports = function replySignupMenu() {
  return (req, res, next) => {
    if (req.renderedReplyMessage) {
      return next();
    }

    return Campaigns.findById(req.user.campaignId)
      .then((campaign) => {
        if (req.botReplyMessage === 'post_signup') {
          return helpers.postSignup(req.user, campaign);
        }

        if (req.botReplyMessage === 'decline_signup') {
          return helpers.declineSignup(req.user, campaign);
        }

        return campaign.getSignupConfirmedMessage();
      })
      .then((message) => {
        req.renderedReplyMessage = message;
        return next();
      });
  };
};
