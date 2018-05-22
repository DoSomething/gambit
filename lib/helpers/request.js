'use strict';

const analytics = require('./analytics');
const helpers = require('../helpers');
const logger = require('../logger');

/**
 * @param {Object} req
 * @return {Promise}
 */
function changeTopic(req) {
  module.exports.setKeyword(req, req.rivescriptMatch);
  const topicId = helpers.macro.getTopicIdFromChangeTopicMacro(req.macro);

  return helpers.topic.fetchById(topicId)
    .then((topic) => {
      module.exports.setTopic(req, topic);
      module.exports.setCampaign(req, topic.campaign);
      return req.conversation.updateTopicAndCampaignId(topicId, topic.campaign.id);
    });
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isTopicChange(req) {
  const result = req.macro && helpers.macro.isChangeTopic(req.macro);
  logger.debug('request.isTopicChange', { result });
  return result;
}

function isClosedCampaign(req) {
  return helpers.campaign.isClosedCampaign(req.campaign);
}

function setCampaign(req, campaign) {
  logger.debug('request.setCampaign', { campaign });
  req.campaign = campaign;
  if (!req.campaignId) {
    module.exports.setCampaignId(req, req.campaign.id);
  }
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
    if (topic.id) {
      analytics.addCustomAttributes({ topicId: topic.id });
    } else {
      // To be deprecated: Used by broadcast message
      analytics.addCustomAttributes({ topic });
    }
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
