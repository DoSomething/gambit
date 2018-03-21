'use strict';

const frontClient = require('../front');
const helpers = require('../helpers');
const logger = require('../logger');

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
    helpers.request.setOutboundMessageText(req, body.text);
    req.frontConversationUrl = body._links.related.conversation;
    logger.debug('origin=front', {
      text: req.outboundMessageText,
      url: req.frontConversationUrl,
    }, req);
    const recipients = body.recipients;

    const fromRecipient = recipients.find(recipient => recipient.role === 'from');
    req.agentId = fromRecipient.handle;

    const toRecipient = recipients.find(recipient => recipient.role === 'to');
    try {
      // TODO: Remove this check once all Front Conversations saved by mobile have been archived.
      const mobileNumber = helpers.util.formatMobileNumber(toRecipient.handle);
      helpers.request.setPlatformUserId(req, mobileNumber);
    } catch (err) {
      helpers.request.setUserId(req, toRecipient.handle);
    }
  },
};
