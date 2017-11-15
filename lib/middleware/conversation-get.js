'use strict';

const logger = require('heroku-logger');
const Conversation = require('../../app/models/Conversation');
const helpers = require('../helpers');

module.exports = function getConversation() {
  return (req, res, next) => Conversation.getFromReq(req)
    .then((conversation) => {
      if (!conversation) return next();

      req.conversation = conversation;
      const lastOutboundMessage = req.conversation.lastOutboundMessage;
      if (lastOutboundMessage) {
        req.lastOutboundTemplate = lastOutboundMessage.template;
        req.lastOutboundBroadcastId = lastOutboundMessage.broadcastId;
      }

      logger.debug('getConversation', helpers.request.injectRequestId({
        conversationId: conversation.id,
        topic: conversation.topic,
      }, req));

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
