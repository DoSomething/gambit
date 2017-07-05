'use strict';

const logger = require('heroku-logger');

module.exports = function declinedContinueTemplate() {
  return (req, res, next) => {
    logger.trace('declinedContinueTemplate req.reply', req.reply);

    if (req.reply.template) {
      return next();
    }

    if (req.user.lastReplyTemplate !== 'continuePromptMessage') {
      return next();
    }

    if (req.reply.brain !== 'declinedCampaign') {
      return next();
    }

    req.reply.template = 'continueDeclinedMessage';

    return next();
  };
};
