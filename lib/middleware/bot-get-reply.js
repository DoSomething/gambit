'use strict';

const bot = require('../bot.js');

module.exports = function getReply() {
  return (req, res, next) => {
    return bot.getReplyForUserMessage(req.user, req.body.message)
      .then((reply) => {
        req.botReplyMessage = reply;
        console.log(`botReplyMessage=${reply}`);

        return next();
      })
      .catch(err => err);
  };
};
