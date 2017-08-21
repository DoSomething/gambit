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
    logger.debug('send-message request.params', req.body);

    if (req.body.phone) {
      req.userId = req.body.phone;
      req.campaignId = req.body.campaignId;
      req.platform = 'sms';
      return next();
    }

    const frontSignature = req.headers['x-front-signature'];
    if (frontSignature && !validateFrontSignature(req.body, frontSignature)) {
      return helpers.sendResponseWithStatusCode(res, 401, 'X-Front-Signature is not valid.');
    }

    req.sendMessageText = req.body.text;
    const recipients = req.body.recipients;
    const toRecipient = recipients.find(recipient => recipient.role === 'to');
    req.userId = toRecipient.handle;
    req.outboundTemplate = 'support';
    req.frontConversationUrl = req.body._links.related.conversation;

    return next();
  };
};
