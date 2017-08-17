'use strict';

const logger = require('heroku-logger');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('send-message request.params', req.body);

    if (req.body.phone) {
      req.userId = req.body.phone;
      req.campaignId = req.body.campaignId;
      req.platform = 'sms';
      return next();
    }

    // TODO: Test for existence of FRONT_API_SECRET

    req.sendMessageText = req.body.text;
    const recipients = req.body.recipients;
    const toRecipient = recipients.find(recipient => recipient.role === 'to');
    req.userId = toRecipient.handle;
    req.outboundTemplate = 'front';
    req.frontConversationUrl = req.body._links.related.conversation;

    return next();
  };
};
