'use strict';

const logger = require('heroku-logger');

const helpers = require('../../helpers');

// Middleware
module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /receive-message req.body', req.body);

    const body = req.body;
    req.inboundMessageText = body.text;

    // Slack
    if (helpers.request.isSlack(req)) {
      helpers.slack.parseBody(req);
      return next();
    }

    // Twilio
    if (helpers.request.isTwilio(req)) {
      return helpers.twilio.parseBody(req)
        .then(() => next())
        .catch(error => helpers.sendErrorResponse(res, error));
    }

    // Facebook Messenger
    if (helpers.request.isFacebook(req)) {
      helpers.facebook.parseBody(req);
      return next();
    }

    // API requests are currently only used by Consolebot for testing. We pass a phone number to
    // mimic User creation for mobile numbers when they don't already exist in Northstar.
    req.platform = 'api';
    req.platformUserId = body.mobile;
    req.platformMessageId = body.platformMessageId;

    const attachmentObject = helpers.attachments.parseFromReq(req);
    if (attachmentObject.url) {
      req.mediaUrl = attachmentObject.url;
      helpers.attachments.add(req, attachmentObject, 'inbound');
    }

    return next();
  };
};
