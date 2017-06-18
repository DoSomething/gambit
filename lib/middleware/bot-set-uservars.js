'use strict';

const bot = require('../bot.js');

module.exports = function setUservars() {
  return (req, res, next) => {
    req.bot = bot.getBot();

    if (req.user && req.user.topic) {
      req.bot.setUservars(req.user._id, { topic: req.user.topic });
    }

    return next();
  };
};
