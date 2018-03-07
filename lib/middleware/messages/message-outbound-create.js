'use strict';

const helpers = require('../../helpers');

module.exports = function createOutboundMessage(config) {
  return (req, res, next) => {
    // Outbound message may have been loaded already if this is a retry request.
    if (req.outboundMessage) {
      return next();
    }

    return req.conversation
      .createAndSetLastOutboundMessage(config.messageDirection, req.outboundMessageText,
        req.outboundTemplate, req)
      .then(() => {
        req.outboundMessage = req.conversation.lastOutboundMessage;
        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
