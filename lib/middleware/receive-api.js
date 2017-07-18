'use strict';

const logger = require('heroku-logger');

module.exports = function params() {
  return (req, res, next) => {
    if (req.platform) {
      return next();
    }

    logger.debug('chatbot request.params', req.body);
    req.userId = req.body.userId;
    req.platform = req.body.platform;
    req.userCommand = req.body.text.toLowerCase().trim();

    return next();
  };
};
