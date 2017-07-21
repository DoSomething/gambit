'use strict';

const helpers = require('../../helpers');

module.exports = function createOutboundReplyMessage() {
  return (req, res, next) => {
    // Skip creating an outbound reply message when we're not actually replying back.
    if (! req.reply.text) {
      return next();
    }

    return req.conversation.createOutboundReplyMessage(req.reply.text, req.reply.template)
      .then((message) => {
        req.outboundMessage = message;

        return next();
      })
      .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
