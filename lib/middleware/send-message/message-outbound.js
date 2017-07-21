'use strict';

module.exports = function outboundMessage() {
  return (req, res, next) => {
    req.conversation.createOutboundSendMessage(req.sendMessageText, req.outboundTemplate)
      .then((message) => {
        req.outboundMessage = message;
        return next();
      })
      .catch(err => err);
  };
};
