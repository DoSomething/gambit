'use strict';

const helpers = require('../helpers.js');

module.exports = function replyMichael() {
  return (req, res, next) => {
    if (req.reply.type || req.user.topic !== 'michael') {
      return next();
    }

    req.reply.type = 'invalidMichaelMessage';
    req.reply.text = helpers.getInvalidMichaelMessage();

    return next();
  };
};
