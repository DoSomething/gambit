'use strict';

const front = require('../../../front');
const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function supportParams() {
  return (req, res, next) => {
    const body = req.body;
    logger.debug('origin=front', body, req);

    if (!front.isValidRequest(req)) {
      return helpers.sendResponseWithStatusCode(res, 401, 'X-Front-Signature is not valid.');
    }

    // TODO: Create helpers.front and move this to its parseBody method
    // @see https://dev.frontapp.com/#sending-messages
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
