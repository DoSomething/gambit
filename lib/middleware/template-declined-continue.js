'use strict';

const logger = require('heroku-logger');

module.exports = function declinedContinueTemplate() {
  return (req, res, next) => {
    logger.trace('declinedContinueTemplate req.reply', req.reply);

    if (req.reply.template) {
      return next();
    }

    const declinedContinue = (req.user.lastReplyTemplate === 'continuePromptMessage' && req.reply.brain === 'declinedCampaign');
    if (declinedContinue) {
      req.reply.template = 'continueDeclinedMessage';
    }

    return next();
  };
};
