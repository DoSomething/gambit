'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');
const Message = require('../../../app/models/Message');

module.exports = function loadOutboundMessage(config) {
  return (req, res, next) => {
    // If this is not a retry request, we have to create a new outbound message
    if (!req.isARetryRequest()) {
      return next();
    }
    const update = {
      metadata: req.metadata,
    };

    logger.debug('loadOutboundMessage: Is a retry request. Proceeding with loading message.', {}, req);

    return Message.updateMessageByRequestIdAndDirection(req.metadata.requestId, update,
      config.messageDirection)
      .then((message) => {
        // If there is no loaded message, it means it was not created successfully
        // so we should attempt to create it in later steps
        if (!message) {
          logger.debug('loadOutboundMessage: Message not found', {}, req);
          return next();
        }
        return req.conversation.setLastOutboundMessage(message)
          .then(() => {
            req.outboundMessage = req.conversation.lastOutboundMessage;
            return next();
          })
          .catch(err => helpers.sendErrorResponse(res, err));
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
