'use strict';

const Messages = require('../../app/models/Message');
const helpers = require('../helpers');

module.exports = function createOutboundMessage() {
  return (req, res, next) => {
    Messages.createOutboundMessage(req)
      .then((message) => {
        req.outboundMessage = message;

        return next();
      })
      .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
