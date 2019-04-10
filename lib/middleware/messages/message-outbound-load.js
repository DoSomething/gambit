'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');
const Message = require('../../../app/models/Message');

module.exports = function loadOutboundMessage(config) {
  return (req, res, next) => {
    // If this request is not being retried, keep going to create an outbound message.
    if (!req.isARetryRequest()) {
      return next();
    }

    logger.debug('loadOutboundMessage: This request is being retried. Let\'s load the outbound message.', {}, req);

    /**
     * If we are here is because this is a request that is being retried fo X reason,
     * maybe a transient error or a timeout in Heroku that caused our broker to think
     * this request didn't make it, etc. We are going to search for it and load it if
     * it was successfully created in the previous unsuccessful attempt.
     */

    // The metadata contains an up to date retry count so we want to update the message with it.
    const update = {
      metadata: req.metadata,
    };

    /**
     * Relying on just on the requestId to determine if the outbound message exists is not so safe.
     * Ideally we would want to implement some hash comparison of the contents of the request
     * instead. The request id just tells us that this request is unique, but we can have two unique
     * requests with the same contents. Specially when it comes to Heroku and how they handle
     * timeouts.
     * TODO: Use a hash of the contents to load an outbound retried request instead of the
     * request id.
     */
    return Message.updateMessageByRequestIdAndDirection(req.metadata.requestId, update,
      config.messageDirection)
      .then((message) => {
        // If the message is null, we did not find it and we need to create it in the
        // next middleware
        if (!message) {
          logger.debug('loadOutboundMessage: Message not found', {}, req);
          return next();
        }
        /**
         * If there is a platformMessageId that means the outbound message was
         * successfully sent to Twilio but most likely Blink got a timeout response
         * from Heroku. We should not resend it.
         * @see https://github.com/DoSomething/gambit-conversations/issues/331
         */
        if (message && message.platformMessageId) {
          // Exposed for monitoring -- Update alert if this log changes.
          logger.info('loadOutboundMessage: Outbound was already sent to member. Suppressing.', {}, req);
          helpers.request.setSuppressOutbound(req);
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
