'use strict';

const helpers = require('../../helpers');
const logger = require('../../logger');

module.exports = function sendOutboundMessage() {
  return (req, res) => {
    if (!req.conversation.isSms()) {
      return helpers.sendResponseWithMessage(res, req.outboundMessage);
    }

    try {
      req.userMobile = helpers.formatMobileNumber(req.user.mobile);
    } catch (err) {
      return helpers.sendErrorResponseWithSuppressHeaders(res, err);
    }

    return req.conversation.postLastOutboundMessageToPlatform(req)
      .then((platformRes) => {
        if (platformRes) {
          // TODO: Save sid to the outboundMessage.platformMessageId.
          const sid = platformRes.sid;
          const status = platformRes.status;
          logger.debug('sendOutboundMessage', { sid, status }, req);
        }
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
