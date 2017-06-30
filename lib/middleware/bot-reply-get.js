'use strict';

const bot = require('../bot.js');

module.exports = function getBotReply() {
  return (req, res, next) => {
    bot.getReply(req.user, req.body.text)
      .then((reply) => {
        req.reply = reply;

        return req.user.updateUserTopic(req.reply.topic);
      })
      .then(() => next())
      .catch(err => err);
  };
};
