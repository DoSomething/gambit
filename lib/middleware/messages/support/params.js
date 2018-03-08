'use strict';

const front = require('../../../front');
const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function supportParams() {
  return (req, res, next) => {
    const body = req.body;

    if (!front.isValidRequest(req)) {
      return helpers.sendResponseWithStatusCode(res, 401, 'X-Front-Signature is not valid.');
    }
    // Set template to support to indicate this was a message sent from a human support agent.
    helpers.request.setOutboundMessageTemplate(req, 'support');

    // TODO: Create helpers.front and move this to its parseBody method
    // @see https://dev.frontapp.com/#sending-messages

    helpers.request.setOutboundMessageText(req, body.text);
    logger.debug('origin=front', { text: req.outboundMessageText }, req);
    const recipients = body.recipients;
    const fromRecipient = recipients.find(recipient => recipient.role === 'from');
    req.agentId = fromRecipient.handle;
    const toRecipient = recipients.find(recipient => recipient.role === 'to');
    helpers.request.setPlatformUserId(req, toRecipient.handle);
    req.platformMessageId = body.id;
    req.frontConversationUrl = body._links.related.conversation;

    return next();
  };
};
