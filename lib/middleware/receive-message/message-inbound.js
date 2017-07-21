'use strict';

const helpers = require('../../helpers');

module.exports = function createInboundMessage() {
  return (req, res, next) => {
    req.conversation.createInboundMessage(req.inboundMessageText)
      .then((message) => {
        req.inboundMessage = message;

        return next();
      })
    .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
