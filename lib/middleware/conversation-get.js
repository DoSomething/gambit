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
        const lastOutboundMessage = req.conversation.lastOutboundMessage;
        if (lastOutboundMessage) {
          req.lastOutboundTemplate = lastOutboundMessage.template;
        } else {
          req.lastOutboundTemplate = null;
        }

        logger.debug('getConversation', {
          conversationId: conversation.id,
          topic: conversation.topic,
        });

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
