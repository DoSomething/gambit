'use strict';

const bot = require('../bot.js');

module.exports = function replyWithRivescript() {
  return (req, res, next) => {
    if (bot.isBotMacro(req.botReplyMessage)) {
      return next();
    }

    req.renderedReplyMessage = req.botReplyMessage;
    console.log(`renderedReplyMessage=${req.renderedReplyMessage}`);

    // Write our bot userVars to User model for future conversations.
    // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
    const botUserVars = req.bot.getUservars(req.user._id);
    req.user.topic = botUserVars.topic;

    return req.user.save()
      .then(() => next())
      .catch(err => err);
  };
};
