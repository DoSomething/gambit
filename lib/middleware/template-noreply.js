'use strict';

module.exports = function replyNoReply() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    if (req.user.paused) {
      req.reply.template = 'noReply';
      req.reply.text = '';
    }

    return next();
  };
};
