'use strict';

const Conversations = require('../../app/models/Conversation');
const helpers = require('../helpers');

module.exports = function getConversation() {
  return (req, res, next) => {
    Conversations.findByPlatformUserId(req.platformUserId)
      .then((conversation) => {
        if (!conversation) return next();

        req.conversation = conversation;

        return next();
      })
      .catch(err => helpers.sendResponseForError(req, res, err));
  };
};
