'use strict';

const logger = require('heroku-logger');

module.exports = function receiveFrontRequest() {
  return (req, res, next) => {
    logger.debug('send-message request.params', req.body);

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
