'use strict';

module.exports = function replyNoReply() {
  return (req, res, next) => {
    if (req.reply.template) {
      return next();
    }

    if (req.reply.brain === 'noReply') {
      req.reply.template = 'noReply';
      req.reply.text = '';
    }

    return next();
  };
};
