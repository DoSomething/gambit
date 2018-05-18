'use strict';

const analytics = require('./analytics');
const helpers = require('../helpers');

/**
 * @param {Object} req
 * @return {Promise}
 */
function changeTopic(req) {
  module.exports.setKeyword(req, req.rivescriptMatch);
  const topicId = helpers.macro.getTopicIdFromChangeTopicMacro(req.macro);
  module.exports.setTopic(req, topicId);

  return helpers.topic.getById(topicId)
    .then((topicObject) => {
      module.exports.setCampaignId(req, topicObject.campaignId);
      return req.conversation.updateTopicAndCampaignId(topicObject.id, req.campaignId);
    })
    .then(() => helpers.campaign.fetchById(req.conversation.campaignId))
    .then(campaignObject => module.exports.setCampaign(req, campaignObject));
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isTopicChange(req) {
  return req.macro && helpers.macro.isChangeTopic(req.macro);
}

function isClosedCampaign(req) {
  return helpers.campaign.isClosedCampaign(req.campaign);
}

function setCampaign(req, campaign) {
  req.campaign = campaign;
}

function setKeyword(req, keyword) {
  req.keyword = keyword;
  analytics.addCustomAttributes({ keyword });
}
/**
 * Request helper
 */
module.exports = {
  changeTopic,
  isClosedCampaign,
  isTopicChange,
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
  setCampaign,
  setCampaignId: function setCampaignId(req, campaignId) {
    req.campaignId = campaignId;
    analytics.addCustomAttributes({ campaignId });
  },
  setConversation: function setConversation(req, conversation) {
    req.conversation = conversation;
    analytics.addCustomAttributes({ conversationId: conversation.id });
    const lastOutboundMessage = conversation.lastOutboundMessage;
    if (lastOutboundMessage) {
      this.setLastOutboundMessage(req, lastOutboundMessage);
    }
  },
  setKeyword,
  setLastOutboundMessage: function setLastOutboundMessage(req, message) {
    req.lastOutboundTemplate = message.template;
    req.lastOutboundBroadcastId = message.broadcastId;
    analytics.addCustomAttributes({
      lastOutboundTemplate: req.lastOutboundTemplate,
      lastOutboundBroadcastId: req.lastOutboundBroadcastId,
    });
  },
  setPlatform: function setPlatform(req, platformString) {
    let platform = platformString;
    if (!platform) {
      platform = 'sms';
    }
    req.platform = platform;
    analytics.addCustomAttributes({ platform });
  },
  setOutboundMessageTemplate: function setOutboundMessageTemplate(req, outboundMessageTemplate) {
    req.outboundMessageTemplate = outboundMessageTemplate;
    analytics.addCustomAttributes({ outboundMessageTemplate });
  },
  setOutboundMessageText: function setOutboundMessageText(req, outboundMessageText) {
    req.outboundMessageText = outboundMessageText;
  },
  setPlatformUserId: function setPlatformUserId(req, platformUserId) {
    req.platformUserId = platformUserId;
    analytics.addCustomAttributes({ platformUserId });
  },
  setTopic: function setTopic(req, topic) {
    req.topic = topic;
    analytics.addCustomAttributes({ topic });
  },
  setUser: function setUser(req, user) {
    req.user = user;
    if (!req.userId) {
      this.setUserId(req, user.id);
    }
  },
  setUserId: function setUserId(req, userId) {
    req.userId = userId;
    analytics.addCustomAttributes({ userId });
  },
  shouldSuppressOutboundReply: function shouldSuppressOutboundReply(req) {
    return req.headers['x-gambit-outbound-reply-suppress'] === 'true';
  },
};
