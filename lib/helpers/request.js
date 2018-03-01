'use strict';

const analytics = require('./analytics');

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
    analytics.addCustomAttributes({ broadcastId });
  },
  setCampaignId: function setCampaignId(req, campaignId) {
    req.campaignId = campaignId;
    analytics.addCustomAttributes({ campaignId });
  },
  setPlatform: function setPlatform(req, platform) {
    req.platform = platform;
    analytics.addCustomAttributes({ platform });
  },
  setPlatformToSms: function setPlatformToSms(req) {
    module.exports.setPlatform(req, 'sms');
  },
  setUserId: function setUserId(req, userId) {
    req.userId = userId;
    analytics.addCustomAttributes({ userId });
  },
  shouldSuppressOutboundReply: function shouldSuppressOutboundReply(req) {
    return req.headers['x-gambit-outbound-reply-suppress'] === 'true';
  },
};
