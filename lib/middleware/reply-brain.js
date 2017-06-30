'use strict';

const helpers = require('../helpers');

module.exports = function replyWithBrainResponse() {
  return (req, res, next) => {
    // If our reply isn't a macro, our reply text is the string returned from the bot. 
    if (!helpers.isMacro(req.reply.brain)) {
      req.reply.type = 'brain';
      req.reply.text = req.reply.brain;
    }

    return next();
  };
};
