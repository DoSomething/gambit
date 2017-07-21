'use strict';

module.exports = function setUserLastReplyTemplate() {
  return (req, res, next) => {
    req.conversation.lastReplyTemplate = req.reply.template;
    req.conversation.save().then(() => next());
  };
};
