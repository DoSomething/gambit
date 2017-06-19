'use strict';

const bot = require('../bot.js');

module.exports = function getReply() {
  return (req, res, next) => {
    return bot.getBot().replyAsync(req.user._id, req.body.message)
      .then((reply) => {
        req.botReplyMessage = reply;

        return next();
      })
      .catch(err => err);
  };
};
