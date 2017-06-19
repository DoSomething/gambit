'use strict';

const Campaigns = require('../../app/models/Campaign');
const helpers = require('../helpers.js');

module.exports = function replySignupKeyword() {
  return (req, res, next) => {
    if (req.renderedReplyMessage) {
      return next();
    }

    return Campaigns.findOne({ keywords: req.body.message.toUpperCase() })
      .then((campaign) => {
        if (!campaign) {
          return next();
        }

        return helpers.postSignup(req.user, campaign)
          .then((message) => {
            req.renderedReplyMessage = message;
            return next();
          })
      });

  };
};
