'use strict';

const helpers = require('../../helpers');

module.exports = function createInboundMessage() {
  return (req, res, next) => {
    // If this is a retry request, we already loaded the message
    if (req.isARetryRequest()) {
      return next();
    }

    // TODO: This should be moved to receive-message/params middleware
    if (req.inboundMessageText) {
      req.userCommand = req.inboundMessageText.trim();
    }

    return req.conversation.createInboundMessage(req)
      .then((message) => {
        req.inboundMessage = message;

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
