'use strict';

const logger = require('heroku-logger');
const gambit = require('../gambit');

module.exports = function declinedContinueTemplate() {
  return (req, res, next) => {
    logger.trace('declinedContinueTemplate req.reply', req.reply);
    console.log(req.user);

    if (req.reply.template) {
      return next();
    }

    if (req.user.lastReplyTemplate !== 'continuePromptMessage') {
      return next();
    }

    if (req.reply.brain !== 'decline_signup') {
      return next();
    }

    req.user.declineSignup();
    req.reply.template = 'signupDeclinedMessage';

    return next();
  };
};
