'use strict';

const helpers = require('../../helpers');

module.exports = function createInboundMessage() {
  return (req, res, next) => {
    if (req.inboundMessageText) {
      req.userCommand = req.inboundMessageText.trim();
    }
    req.conversation.createMessage('inbound', req.inboundMessageText, null, req.attachments)
      .then((message) => {
        req.inboundMessage = message;

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
