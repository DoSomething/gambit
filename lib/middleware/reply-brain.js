'use strict';

const helpers = require('../helpers');

module.exports = function replyWithBrainResponse() {
  return (req, res, next) => {
    if (helpers.isMacro(req.reply.brain)) {
      return next();
    }

    req.reply.type = 'brain';
    req.reply.text = req.reply.brain;

    return req.user.updateUserTopic(req.reply.topic)
      .then(() => next())
      .catch(err => err);
  };
};
