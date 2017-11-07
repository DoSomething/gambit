'use strict';

const logger = require('heroku-logger');
const Promise = require('bluebird');

const helpers = require('../helpers');
const Message = require('../../app/models/Message');

module.exports = function loadOutboundMessage(config) {
  return (req, res, next) => {
    // If this is not a retry request, we have to create a new outbound message
    if (!req.isARetryRequest()) {
      return next();
    }
    logger.debug('loadOutboundMessage: Is a retry request. Proceeding with loading message.', config);
    logger.debug('loadOutboundMessage: metadata.', req.metadata);

    const update = {
      metadata: req.metadata,
    };

    return Message.updateMessageByRequestIdAndDirection(req.metadata.requestId, update,
      config.messageDirection)
      .then((message) => {
        // If there is no loaded message, it means it was not created successfully
        // so we should attempt to create it
        if (!message) {
          logger.debug('loadOutboundMessage: Message not found. Calling next to attempt to create it.', config);
          return next();
        }
        return req.conversation.setLastOutboundMessage(message)
          .then(() => {
            let promise = Promise.resolve();
            if (config.shouldPostToPlatform) {
              promise = req.conversation.postLastOutboundMessageToPlatform();
            }
            return promise;
          })
          .then(() => helpers.sendResponseWithMessage(res, req.conversation.lastOutboundMessage))
          .catch(err => helpers.sendErrorResponse(req, res, err));
      })
      .catch(err => helpers.sendErrorResponse(req, res, err));
  };
};
