'use strict';

const crypto = require('crypto');
const logger = require('../../logger');
const helpers = require('../../helpers');

/**
 * Validates incoming Front request.
 * @see https://dev.frontapp.com/#checking-data-integrity
 * @param {object} data
 * @param {string} signature
 * @return {boolean}
 */
function isValidFrontSignature(data, signature) {
  const apiSecret = process.env.FRONT_API_SECRET;
  const hash = crypto.createHmac('sha1', apiSecret).update(JSON.stringify(data)).digest('base64');

  return hash === signature;
}

module.exports = function supportParams() {
  return (req, res, next) => {
    const body = req.body;
    logger.debug('send-message request.params', body, req);

    const frontSignature = req.headers['x-front-signature'];
    if (!frontSignature) {
      return next();
    }

    if (!isValidFrontSignature(body, frontSignature)) {
      return helpers.sendResponseWithStatusCode(res, 401, 'X-Front-Signature is not valid.');
    }

    // TODO: Create helpers.front and move this to its parseBody method
    req.outboundMessageText = body.text;
    const recipients = body.recipients;
    const fromRecipient = recipients.find(recipient => recipient.role === 'from');
    req.agentId = fromRecipient.handle;
    const toRecipient = recipients.find(recipient => recipient.role === 'to');
    req.platformUserId = toRecipient.handle;
    req.platformMessageId = body.id;
    req.outboundTemplate = 'support';
    req.frontConversationUrl = body._links.related.conversation;

    return next();
  };
};
