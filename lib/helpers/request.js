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
    analytics.addParameters({ broadcastId });
  },
  setCampaignId: function setCampaignId(req, campaignId) {
    req.campaignId = campaignId;
    analytics.addParameters({ campaignId });
  },
  setPlatform: function setPlatform(req, platform) {
    req.platform = platform;
    analytics.addParameters({ platform });
  },
  setPlatformToSms: function setPlatformToSms(req) {
    module.exports.setPlatform(req, 'sms');
  },
  setUserId: function setUserId(req, userId) {
    req.userId = userId;
    analytics.addParameters({ userId });
  },
  shouldSuppressOutboundReply: function shouldSuppressOutboundReply(req) {
    return req.headers['x-gambit-outbound-reply-suppress'] === 'true';
  },
};
