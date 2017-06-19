'use strict';

const bot = require('../bot.js');

module.exports = function setUservars() {
  return (req, res, next) => {
    bot.setTopicForUser(req.user);

    return next();
  };
};
