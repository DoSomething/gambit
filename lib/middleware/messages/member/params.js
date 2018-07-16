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
      const error = new UnprocessibleEntityError('Missing required origin parameter.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    if (helpers.request.isTwilio(req)) {
      return helpers.twilio.parseBody(req)
        .then(() => next())
        .catch(error => helpers.sendErrorResponse(res, error));
    }

    helpers.request.setPlatform(req, origin);

    const body = req.body;
    const userId = helpers.request.getUserIdParamFromReq(req);
    helpers.request.setUserId(req, userId);
    if (!req.userId) {
      const error = new UnprocessibleEntityError('Missing required userId.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }
    req.platformMessageId = body.messageId;
    req.inboundMessageText = body.text;

    const attachmentObject = helpers.attachments.parseFromReq(req);
    if (attachmentObject.url) {
      req.mediaUrl = attachmentObject.url;
      helpers.attachments.add(req, attachmentObject, 'inbound');
    }

    return next();
  };
};
