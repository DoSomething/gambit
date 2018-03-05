'use strict';

const analyticsHelper = require('./analytics');

/**
 * Request helper
 */
module.exports = {
  isTwilio: function isTwilio(req) {
    return req.query.origin === 'twilio';
  },
  parseCampaignKeyword: function parseCampaignKeyword(req) {
    const text = req.inboundMessageText;
    if (!text) {
      return null;
    }
    return text.trim().toLowerCase();
  },
  setBroadcastId: function setBroadcastId(req, broadcastId) {
    req.broadcastId = broadcastId;
    analyticsHelper.addCustomAttributes({ broadcastId });
  },
  setCampaignId: function setCampaignId(req, campaignId) {
    req.campaignId = campaignId;
    analyticsHelper.addCustomAttributes({ campaignId });
  },
  setConversation: function setConversation(req, conversation) {
    req.conversation = conversation;
    analyticsHelper.addCustomAttributes({ conversationId: conversation.id });
    const lastOutboundMessage = conversation.lastOutboundMessage;
    if (lastOutboundMessage) {
      req.lastOutboundTemplate = lastOutboundMessage.template;
      req.lastOutboundBroadcastId = lastOutboundMessage.broadcastId;
    }
  },
  setPlatform: function setPlatform(req, platform) {
    req.platform = platform;
    analyticsHelper.addCustomAttributes({ platform });
  },
  setPlatformToSms: function setPlatformToSms(req) {
    this.setPlatform(req, 'sms');
  },
  setUser: function setUser(req, user) {
    req.user = user;
    if (!req.userId) {
      this.setUserId(req, user.id);
    }
  },
  setUserId: function setUserId(req, userId) {
    req.userId = userId;
    analyticsHelper.addCustomAttributes({ userId });
  },
  shouldSuppressOutbound: function shouldSuppressOutbound(req) {
    return req.headers['x-gambit-outbound-suppress'] === 'true';
  },
};
