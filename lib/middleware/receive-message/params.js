'use strict';

const logger = require('heroku-logger');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /receive-message req.body', req.body);

    const body = req.body;
    if (body.slackId) {
      req.platform = 'slack';
      req.platformUserId = body.slackId;
      req.slackChannel = body.slackChannel;
    } else if (body.phone) {
      req.platform = 'twilio';
      req.platformUserId = body.phone;
    } else if (body.facebookId) {
      req.platform = 'facebook';
      req.platformUserId = body.facebookId;
    }
    // TODO: Add default for API / Consolebot.

    req.inboundMessageText = body.text;
    if (req.inboundMessageText) {
      req.userCommand = req.inboundMessageText.trim();
    }

    return next();
  };
};
