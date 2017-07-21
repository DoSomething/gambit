'use strict';

module.exports = function setConversationLastOutboundTemplate() {
  return (req, res, next) => {
    req.conversation.lastOutboundTemplate = req.reply.template;
    req.conversation.save().then(() => next());
  };
};
