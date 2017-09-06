'use strict';

module.exports = function outboundMessage() {
  return (req, res, next) => {
    req.conversation.createOutboundImportMessage(req.importMessageText, req.outboundTemplate, req)
      .then((message) => {
        req.outboundMessage = message;
        return next();
      })
      .catch(err => err);
  };
};
