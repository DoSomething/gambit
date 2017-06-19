'use strict';

const helpers = require('../helpers.js');

module.exports = function replyMichael() {
  return (req, res, next) => {
    if (req.renderedReplyMessage || req.user.topic != 'michael') {
      return next();
    }
    req.renderedReplyMessage = helpers.getInvalidMichaelMessage();

    return next();
  };
};
