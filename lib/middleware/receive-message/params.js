'use strict';

const logger = require('heroku-logger');

const helpers = require('../../helpers');

// Middleware
module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /receive-message req.body', req.body);

    const body = req.body;
    req.inboundMessageText = body.text;
    req.attachments = {
      inbound: [],
      outbound: [],
    };

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

    // Messenger
    if (helpers.request.isFacebook(req)) {
      helpers.facebook.parseBody(req);
      return next();
    }

    // Api
    req.platformUserId = body.platformUserId;
    req.platform = 'api';

    const attachmentObject = helpers.attachments.parseFromReq(req);
    if (attachmentObject.url) {
      req.mediaUrl = attachmentObject.url;
      helpers.attachments.add(req, attachmentObject, 'inbound');
    }

    return next();
  };
};
