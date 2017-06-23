'use strict';

const helpers = require('../helpers.js');

module.exports = function replyMichael() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    if (req.user.topic === 'michael') {
      req.reply.type = 'invalidMichaelMessage';
      req.reply.text = helpers.getInvalidMichaelMessage();
    }

    return next();
  };
};
