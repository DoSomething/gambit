'use strict';

const logger = require('heroku-logger');

module.exports = function promptContinueCampaignTemplate() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    // If the last reply Template was Gambit, our User is already talking about their Campaign.
    if (req.user.lastReplyTemplate === 'gambit') {
      return next();
    }

    // Let's prompt User to continue chatting Gambit Campaigns.
    logger.debug('continuePromptMessage');
    req.reply.template = 'continuePromptMessage';

    return next();
  };
};
