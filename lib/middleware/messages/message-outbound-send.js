'use strict';

const helpers = require('../../helpers');
const logger = require('../../logger');

module.exports = function sendOutboundMessage() {
  return (req, res) => {
    if (!req.conversation.isSms()) {
      return helpers.sendResponseWithMessage(res, req.outboundMessage);
    }

    return req.conversation.postLastOutboundMessageToPlatform()
      .then((twilioRes) => {
        // TODO: Save sid to the outboundMessage.platformMessageId.
        const sid = twilioRes.sid;
        const status = twilioRes.status;
        logger.debug('sendOutboundMessage', { sid, status }, req);
        return helpers.sendResponseWithMessage(res, req.outboundMessage);
      })
      .catch((err) => {
        if (helpers.twilio.isBadRequestError(err)) {
          helpers.analytics.addTwilioError(err);
          logger.error('sendOutboundMessage', { err }, req);
          return helpers.sendErrorResponseWithSuppressHeaders(res, err);
        }
        return helpers.sendErrorResponse(res, err);
      });
  };
};
