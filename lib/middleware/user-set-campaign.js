'use strict';

const logger = require('heroku-logger');
const gambit = require('../gambit');

module.exports = function setUserCampaign() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    // If we haven't set a keyword already and this isn't the confirmedCampaign macro, no need to
    // update the User's campaign.
    if (! req.keyword || req.reply.brain !== 'confirmedCampaign') {
      return next();
    }

    let source = 'keyword';
    if (! req.keyword) {
      source = 'menu';
      // Pass the Campaign keyword to Gambit to change the Gambit User Campaign.
      req.keyword = req.campaign.keywords[0];
    }

    req.user.signupForCampaign(req.campaign, source, req.keyword);

    return next();
  }
};
