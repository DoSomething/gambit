'use strict';

const bot = require('../bot.js');

module.exports = function getReply() {
  return (req, res, next) => {
    bot.getReply(req.user, req.body.text)
      .then((text) => {
        req.reply = {
          rivescript: text,
        };
        console.log(`req.reply.rivescript=${text}`);

        return next();
      })
      .catch(err => err);
  };
};
