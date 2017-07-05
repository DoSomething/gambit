'use strict';

const logger = require('heroku-logger');
const Campaigns = require('../../app/models/Campaign');
const helpers = require('../helpers.js');

module.exports = function askSignupTemplate() {
  return (req, res, next) => {
    logger.trace('askSignupTemplate req.reply', req.reply);

    if (req.reply.template) {
      return next();
    }

    let prompt = false;

    if (helpers.isMenuCommand(req.userCommand)) {
      prompt = true;
    } else if (req.user.signupStatus === 'declined') {
      prompt = true;
    }

    if (! prompt) {
      return next();
    }

    // Find a random Campaign to prompt for Signup.
    // Eventually query Signups to find Campaigns that are new to User, within their interests, etc.
    return Campaigns.getRandomCampaign()
      .then((campaign) => {
        req.campaign = campaign;
        req.user.setCampaign(campaign);
        req.reply.template = 'askSignupMessage';

        return next();
      });
  };
};
