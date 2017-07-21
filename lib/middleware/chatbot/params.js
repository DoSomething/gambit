'use strict';

const logger = require('heroku-logger');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /receive-message req.body', req.body);

    const conversation = req.body.conversation;
    if (conversation.slackId) {
      req.platform = 'slack';
      req.platformUserId = conversation.slackId;
      req.slackChannel = conversation.slackChannel;
    }

    req.inboundMessageText = req.body.text;
    req.userCommand = req.body.text.toLowerCase().trim();

    return next();
  };
};
