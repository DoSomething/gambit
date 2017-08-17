'use strict';

const logger = require('heroku-logger');
const request = require('request-promise');

const helpers = require('../../helpers');

function getMediaObject(req) {
  return {
    redirectUrl: req.body.MediaUrl0,
    contentType: req.body.MediaContentType0,
  };
}

function addAttachmentToMessageCustomProps(req, attachmentObject) {
  if (!req.messageCustomProps.attachments) {
    req.messageCustomProps.attachments = [];
  }

  if (attachmentObject.attachmentUrl) {
    req.messageCustomProps.attachments.push({
      url: attachmentObject.attachmentUrl,
      contentType: attachmentObject.contentType,
    });
  }
}

function getTwilioAttachmentUrl(redirectUrl) {
  const options = {
    uri: redirectUrl,
    resolveWithFullResponse: true,
  };

  return request(options)
    .then((redirectRes) => {
      let attachmentUrl = '';
      try {
        attachmentUrl = redirectRes.request.uri.href;
      } catch (error) {
        // TODO: Log that lookup of href failed.
        // The data structure might have changed and code needs to be updated.
      }
      return attachmentUrl;
    });
}

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /receive-message req.body', req.body);

    const body = req.body;
    req.inboundMessageText = body.text;
    req.messageCustomProps = {};

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

      const attachmentObject = getMediaObject(req);

      if (attachmentObject.redirectUrl) {
        return getTwilioAttachmentUrl(attachmentObject.redirectUrl)
          .then((attachmentUrl) => {
            attachmentObject.attachmentUrl = attachmentUrl;
            req.mediaUrl = attachmentUrl;
            addAttachmentToMessageCustomProps(req, attachmentObject);
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

    return next();
  };
};
