'use strict';

const logger = require('heroku-logger');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /receive-message req.body', req.body);

    const body = req.body;
    req.inboundMessageText = body.text;

    if (req.query.medium === 'mobilecommons') {
      req.platform = 'mobilecommons';
      req.userId = body.phone;

      const keyword = req.body.keyword;
      if (keyword) {
        req.inboundMessageText = keyword;
      }

      return next();
    }

    if (body.slackId) {
      req.platform = 'slack';
      req.userId = body.slackId;
      req.slackChannel = body.slackChannel;

      return next();
    }

    if (body.phone) {
      req.platform = 'twilio';
      req.userId = body.phone;

      return next();
    }

    if (body.facebookId) {
      req.platform = 'facebook';
      req.userId = body.facebookId;

      return next();
    }

    req.userId = body.userId;
    req.platform = 'api';

    return next();
  };
};
