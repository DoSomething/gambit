'use strict';

const logger = require('heroku-logger');
const Conversations = require('../../app/models/Conversation');
const helpers = require('../helpers');

module.exports = function getConversation() {
  return (req, res, next) => {
    Conversations.getFromReq(req)
      .then((conversation) => {
        if (!conversation) return next();

        req.conversation = conversation;
        logger.debug('getConversation', { 
          conversationId: conversation._id.toString(),
          topic: conversation.topic,
        });

        return next();
      })
      .catch(err => helpers.sendResponseForError(req, res, err));
  };
};
