'use strict';

const Messages = require('../../app/models/Message');
const helpers = require('../helpers');

module.exports = function createInboundMessage() {
  return (req, res, next) => {
    const data = {
      direction: 'inbound',
      body: req.body.message,
      userId: req.body.userId,
    };

    return Messages
      .create(data)
      .then((message) => {
        req.inboundMessage = message;

        return next();
      })
    .catch((err) => {
      console.log(err);
      return helpers.sendChatbotResponseForError(req, res, err);
    });
  };
};
