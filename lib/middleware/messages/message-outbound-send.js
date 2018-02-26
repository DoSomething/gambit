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
        const sid = twilioRes.sid;
        const status = twilioRes.status;
        logger.debug('twilio response', { sid, status });
        return helpers.sendResponseWithMessage(res, req.outboundMessage);
      })
      .catch((err) => {
        if (err.status === 400) {
          const params = {
            twillioErrorCode: err.code,
            twilioErrorStatus: err.status,
          };
          helpers.analytics.addParameters(params);
          return helpers.sendErrorResponseWithSuppressHeaders(res, err);
        }
        return helpers.sendErrorResponse(res, err);
      });
  };
};
