'use strict';

const crypto = require('crypto');
const logger = require('heroku-logger');
const helpers = require('../../helpers');

/**
 * Validates incoming Front request.
 * @see https://dev.frontapp.com/#checking-data-integrity
 * @param {object} data
 * @param {string} signature
 * @return {boolean}
 */
function validateFrontSignature(data, signature) {
  const apiSecret = process.env.FRONT_API_SECRET;
  const hash = crypto.createHmac('sha1', apiSecret).update(JSON.stringify(data)).digest('base64');

  return hash === signature;
}

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    logger.debug('send-message request.params', body);

    // TODO: If we have a phone or slackId, campaignId and template params are required.
    req.campaignId = body.campaignId;

    if (body.phone) {
      req.userId = body.phone;
      req.platform = 'sms';

      return next();
    }

    if (body.slackId) {
      req.platform = 'slack';
      req.userId = body.slackId;

      return next();
    }

    const frontSignature = req.headers['x-front-signature'];
    if (frontSignature && !validateFrontSignature(body, frontSignature)) {
      return helpers.sendResponseWithStatusCode(res, 401, 'X-Front-Signature is not valid.');
    }

    req.sendMessageText = body.text;
    const recipients = body.recipients;
    const toRecipient = recipients.find(recipient => recipient.role === 'to');
    req.userId = toRecipient.handle;
    req.outboundTemplate = 'support';
    req.frontConversationUrl = body._links.related.conversation;

    return next();
  };
};
