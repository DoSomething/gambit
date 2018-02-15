'use strict';

const helpers = require('../../../helpers');
const logger = require('../../../logger');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

// Middleware
module.exports = function params() {
  return (req, res, next) => {
    const origin = req.query.origin;
    logger.debug(`origin=${origin}`, { params: req.body }, req);
    if (!origin) {
      const error = new UnprocessibleEntityError('Invalid or missing origin parameter. ');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    if (helpers.request.isTwilio(req)) {
      return helpers.twilio.parseBody(req)
        .then(() => next())
        .catch(error => helpers.sendErrorResponse(res, error));
    }

    req.platform = origin;
    req.platformUserId = req.body.northstarId;
    req.platformMessageId = req.body.messageId;
    req.inboundMessageText = req.body.text;

    const attachmentObject = helpers.attachments.parseFromReq(req);

    if (attachmentObject.url) {
      req.mediaUrl = attachmentObject.url;
      helpers.attachments.add(req, attachmentObject, 'inbound');
    }

    return next();
  };
};
