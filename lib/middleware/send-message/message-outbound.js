'use strict';

module.exports = function outboundMessage() {
  return (req, res, next) => {
    req.user.createOutboundSendMessage(req.sendMessageText, req.outboundTemplate)
      .then(() => next())
      .catch(err => err);
  };
};
