'use strict';

module.exports = function replyNoReply() {
  return (req, res, next) => {
    if (req.reply.type) {
      return next();
    }

    if (req.reply.brain === 'noReply') {
      req.reply.type = 'noReply';
      req.reply.text = '';
    }

    return next();
  };
};
