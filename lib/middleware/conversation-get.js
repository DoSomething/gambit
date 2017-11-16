'use strict';

const logger = require('../logger');
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

      const logProperties = {
        conversationId: conversation.id,
        lastOutboundBroadcastId: req.lastOutboundBroadcastId ? req.lastOutboundBroadcastId : null,
        lastOutboundCampaignId: conversation.campaignId ? conversation.campaignId : null,
        lastOutboundTemplate: req.lastOutboundTemplate ? req.lastOutboundTemplate : null,
        lastOutboundTopic: conversation.topic,
      };

      logger.debug('getConversation', logProperties, req);
      helpers.analytics.addParameters(logProperties);

      return next();
    })
    .catch(err => helpers.sendErrorResponse(res, err));
};
