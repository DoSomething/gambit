'use strict';

const logger = require('heroku-logger');

const helpers = require('../../helpers');
const Message = require('../../../app/models/Message');

module.exports = function loadOutboundImportMessage() {
  return (req, res, next) => {
    // If this is not a retry request, we have to create a new outbound message
    if (!req.isARetryRequest()) {
      return next();
    }
    logger.debug('loadOutboundImportMessage: Is a retry request. Proceeding with loading message.');
    return Message.updateOutboundApiImportMessageMetadataByRequestId(req.metadata.requestId,
      req.metadata)
      .then((message) => {
        // If there is no loaded message, it means it was not created successfully
        // so we should attempt to create it
        if (!message) {
          logger.debug('loadOutboundImportMessage: Message not found. Calling next to attempt to create it.');
          return next();
        }
        return req.conversation.setLastOutboundMessage(message)
          .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage));
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
