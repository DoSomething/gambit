'use strict';

const helpers = require('../../../helpers');
const Message = require('../../../../app/models/Message');

module.exports = function loadInboundMessage() {
  return (req, res, next) => {
    // If this is not a retry request, we have to create a new inbound message
    if (!req.isARetryRequest()) {
      return next();
    }

    return Message.updateInboundMessageMetadataByRequestId(req.metadata.requestId,
      req.metadata)
      .then((message) => {
        req.inboundMessage = message;

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
