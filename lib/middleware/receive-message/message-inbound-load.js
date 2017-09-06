'use strict';

const helpers = require('../../helpers');

module.exports = function loadInboundMessage() {
  return (req, res, next) => {
    // If this is not a retry request, we have to create a new inbound message
    if (!req.isARetryRequest()) {
      return next();
    }

    // TODO: This should be moved to receive-message/params middleware
    if (req.inboundMessageText) {
      req.userCommand = req.inboundMessageText.trim();
    }

    return req.conversation.loadInboundMessageAndUpdateMetadataByRequestId(req.metadata.requestId,
      req.metadata)
      .then((message) => {
        req.inboundMessage = message;

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
