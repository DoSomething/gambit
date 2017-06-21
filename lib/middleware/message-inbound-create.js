'use strict';

const Messages = require('../../app/models/Message');
const helpers = require('../helpers');

module.exports = function createInboundMessage() {
  return (req, res, next) => {
    Messages.createInboundMessage(req.user, req.body.message)
      .then((message) => {
        req.inboundMessage = message;

        return next();
      })
    .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
