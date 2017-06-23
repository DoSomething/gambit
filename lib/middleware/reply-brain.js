'use strict';

const bot = require('../bot');
const helpers = require('../helpers');

module.exports = function replyWithRivescript() {
  return (req, res, next) => {
    if (helpers.isBotMacro(req.reply.rivescript)) {
      return next();
    }

    req.reply.type = 'brain';
    req.reply.text = req.reply.rivescript;

    // Write our bot userVars to User model for future conversations.
    // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
    const botUserVars = bot.getBot().getUservars(req.user._id);
    req.user.topic = botUserVars.topic;

    return req.user.save()
      .then(() => next())
      .catch(err => err);
  };
};
