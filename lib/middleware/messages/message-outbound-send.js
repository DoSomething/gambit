'use strict';

const helpers = require('../../helpers');
const logger = require('../../logger');

module.exports = function sendOutboundMessage() {
  return async (req, res) => {
    if (helpers.request.shouldSuppressOutboundReply(req)) {
      logger.debug('sendOutboundMessage: suppressing reply', {}, req);
    } else {
      try {
        await req.conversation.postLastOutboundMessageToPlatform(req);
      } catch (error) {
        if (helpers.twilio.isBadRequestError(error)) {
          helpers.analytics.addTwilioError(error);
          logger.error('sendOutboundMessage: Twilio bad request error', { error }, req);
          return helpers.sendErrorResponseWithNoRetry(res, error);
        }
        return helpers.sendErrorResponse(res, error);
      }
    }
    return helpers.sendResponseWithMessage(res, req.outboundMessage);
  };
};
