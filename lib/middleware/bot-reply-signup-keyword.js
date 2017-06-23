'use strict';

const Campaigns = require('../../app/models/Campaign');
const helpers = require('../helpers.js');

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

        return helpers.postSignup(req.user, campaign)
          .then((message) => {
            req.reply.text = message;
            return next();
          });
      });
  };
};
