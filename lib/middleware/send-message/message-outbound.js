'use strict';

module.exports = function outboundMessage() {
  return (req, res, next) => {
    req.conversation.createOutboundSendMessage(req.sendMessageText, req.outboundTemplate)
      .then(() => next())
      .catch(err => err);
  };
};
