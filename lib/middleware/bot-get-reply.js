'use strict';

const bot = require('../bot.js');

module.exports = function getBotReply() {
  return (req, res, next) => {
    bot.getReply(req.user, req.body.text)
      .then((text) => {
        req.reply = { brain: text };

        return next();
      })
      .catch(err => err);
  };
};
