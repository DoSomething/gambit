'use strict';

const analytics = require('./analytics');

/**
 * Request helper
 */
module.exports = {
  isTwilio: function isTwilio(req) {
    return req.query.origin === 'twilio';
  },
  // This function can be removed once /v1/import message is deprecated.
  isTwilioStatusCallback: function isTwilioStatusCallback(req) {
    const messageStatus = req.body.MessageStatus;

    /**
     * Twilio has received confirmation of message delivery from the upstream carrier,
     * and, where available, the destination handset.
     * @see https://www.twilio.com/docs/api/messaging/message#message-status-values
     */
    return messageStatus === 'delivered';
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
  setUserId: function setUserId(req, userId) {
    req.userId = userId;
    analytics.addParameters({ userId });
  },
  shouldSuppressOutboundReply: function shouldSuppressOutboundReply(req) {
    return req.headers['x-gambit-outbound-reply-suppress'] === 'true';
  },
};
