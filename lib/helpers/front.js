'use strict';

const logger = require('../logger');
const frontClient = require('../front');
const requestHelper = require('./request');

module.exports = {
  getConversationByUrl: function getConversationByUrl(url) {
    return frontClient.get(url);
  },
  isConversationArchived: function isConversationArchived(frontConversation) {
    return frontConversation.status === 'archived';
  },
  /**
   * Parses properties out of the body of a Front request.
   * @see https://dev.frontapp.com/#sending-messages
   * @param {object} req
   */
  parseBody: function parseBody(req) {
    const body = req.body;
    requestHelper.setOutboundMessageText(req, body.text);
    logger.debug('origin=front', { text: req.outboundMessageText }, req);
    const recipients = body.recipients;
    const fromRecipient = recipients.find(recipient => recipient.role === 'from');
    req.agentId = fromRecipient.handle;
    const toRecipient = recipients.find(recipient => recipient.role === 'to');
    requestHelper.setUserId(req, toRecipient.handle);
    req.platformMessageId = body.id;
    req.frontConversationUrl = body._links.related.conversation;
  },
};
