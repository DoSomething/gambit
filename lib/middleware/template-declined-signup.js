'use strict';

const logger = require('heroku-logger');
const gambit = require('../gambit');

module.exports = function declinedSignupTemplate() {
  return (req, res, next) => {
    logger.trace('declinedSignupTemplate req.reply', req.reply);

    if (req.reply.template) {
      return next();
    }

    if (req.user.lastReplyTemplate !== 'signupPromptMessage') {
      return next();
    }

    if (req.reply.brain !== 'declinedCampaign') {
      return next();
    }

    req.user.declineSignup();
    req.reply.template = 'signupDeclinedMessage';

    return next();
  };
};
