'use strict';

const logger = require('heroku-logger');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('chatbot request.params', req.body);
    req.userId = req.body.userId;

    return next();
  };
};
