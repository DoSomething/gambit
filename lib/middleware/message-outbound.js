'use strict';

const Messages = require('../../app/models/Message');
const helpers = require('../helpers');

module.exports = function createReplyMessage() {
  return (req, res, next) => {
    Messages.create({
      direction: 'outbound',
      body: req.renderedReplyMessage,
      userId: req.body.userId,
      topic: req.user.topic,
      campaignId: req.user.campaignId,
    })
    .then((message) => {
      req.outboundMessage = message;

      return next();
    })
    .catch(err => helpers.sendChatbotResponseForError(req, res, err));
  };
};
