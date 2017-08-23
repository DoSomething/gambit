'use strict';

const logger = require('heroku-logger');
const request = require('request-promise');

const helpers = require('../../helpers');

function getTwilioAttachmentObject(req) {
  return {
    redirectUrl: req.body.MediaUrl0,
    contentType: req.body.MediaContentType0,
  };
}

function getAttachmentObject(req) {
  return {
    url: req.body.mediaUrl,
  };
}

function addAttachment(req, attachmentObject) {
  if (attachmentObject.url) {
    req.attachments.push({
      url: attachmentObject.url,
      contentType: attachmentObject.contentType,
    });
  }
}

function getTwilioAttachmentUrl(redirectUrl) {
  const options = {
    uri: redirectUrl,
    // needed, otherwise returns the parsed body
    resolveWithFullResponse: true,
  };

  return request(options)
    .then((redirectRes) => {
      let url = '';
      try {
        url = redirectRes.request.uri.href;
      } catch (error) {
        // TODO: Log that lookup of href failed.
        // The data structure might have changed and code needs to be updated.
      }
      return url;
    });
}

// Middleware
module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /receive-message req.body', req.body);

    const body = req.body;
    req.inboundMessageText = body.text;
    req.attachments = [];

    if (body.slackId) {
      req.platform = 'slack';
      req.userId = body.slackId;
      req.slackChannel = body.slackChannel;

      return next();
    }

    if (body.MessageSid) {
      req.platform = 'sms';
      req.userId = body.From;
      req.inboundMessageText = body.Body;

      const attachmentObject = getTwilioAttachmentObject(req);

      if (attachmentObject.redirectUrl) {
        return getTwilioAttachmentUrl(attachmentObject.redirectUrl)
          .then((url) => {
            req.mediaUrl = url;
            attachmentObject.url = url;
            addAttachment(req, attachmentObject);
            return next();
          })
          .catch(error => helpers.sendGenericErrorResponse(res, error));
      }
      return next();
    }

    if (body.facebookId) {
      req.platform = 'facebook';
      req.userId = body.facebookId;

      return next();
    }

    req.userId = body.userId;
    req.platform = 'api';

    const attachmentObject = getAttachmentObject(req);
    if (attachmentObject.url) {
      req.mediaUrl = attachmentObject.url;
      addAttachment(req, attachmentObject);
    }

    return next();
  };
};
