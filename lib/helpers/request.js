'use strict';

const helpers = require('../helpers');
const gambitCampaigns = require('../gambit-campaigns');
const logger = require('../logger');
const analytics = require('./analytics');

/**
 * @param {Object} req
 * @param {Object} topic
 * @return {Promise}
 */
function changeTopic(req, topic) {
  module.exports.setTopic(req, topic);
  return req.conversation.changeTopic(topic);
}

/**
 * @param {Object} req
 * @param {Object} topic
 * @return {Promise}
 */
function changeTopicByCampaign(req, campaign) {
  module.exports.setCampaign(req, campaign);
  if (!campaign.topics.length) {
    return Promise.reject(new Error('Campaign does not have any topics'));
  }
  // For now, each campaign only has one topic so we can get away with this.
  // In the future; signup messages will need to find the selected topic to set conversation to
  // if a campaign supports multiple topics at once.
  // Broadcasts will eventually be topic specific instead of campaign specific, meaning we would
  // no longer call this function from the broadcast middleware, we'd have a nested topic object
  // included in a get broadcast lookup.
  const topic = campaign.topics[0];
  // Inject a campaign property into the topic, as we'll need it for the call to changeTopic.
  topic.campaign = campaign;
  return module.exports.changeTopic(req, topic);
}

/**
 * @param {Object} req
 * @return {Promise}
 */
function executeChangeTopicMacro(req) {
  module.exports.setKeyword(req, req.rivescriptMatch);
  const topicId = req.rivescriptReplyTopic;
  return helpers.topic.fetchById(topicId)
    .then((topic) => {
      logger.debug('helpers.topic.fetchById success', { topicId }, req);
      return module.exports.changeTopic(req, topic);
    });
}

/**
 * @param {Object} req
 * @return {Object}
 */
function getCampaignActivityPayloadFromReq(req) {
  const data = {
    userId: req.userId,
    campaignId: req.campaign.id,
    campaignRunId: req.campaign.currentCampaignRun.id,
    postType: req.topic.postType,
    text: req.inboundMessageText,
    mediaUrl: req.mediaUrl,
    broadcastId: req.broadcastId,
    platform: req.platform,
  };
  if (req.keyword) {
    data.keyword = req.keyword.toLowerCase();
  }

  return data;
}

/**
 * @param {Object} req
 * @param {String} topicId
 * @return {Promise}
 */
function getRivescriptReply(req, topicId = null) {
  return helpers.rivescript
    .getBotReply(req.userId, topicId || req.conversation.topic, req.inboundMessageText);
}

/**
 * @param {Object} req
 * @return {Promise}
 */
function parseAskYesNoResponse(req) {
  // @see brain/topics
  return module.exports.getRivescriptReply(req, 'ask_yes_no')
    .then((rivescriptReply) => {
      req.askYesNoResponse = rivescriptReply.text;
    });
}

/**
 * @param {Object} req
 * @return {Promise}
 */
function postCampaignActivityFromReq(req) {
  return gambitCampaigns
    .postCampaignActivity(module.exports.getCampaignActivityPayloadFromReq(req));
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function hasCampaign(req) {
  return !!req.campaign;
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isAutoReplyTopic(req) {
  return req.topic && helpers.topic.isAutoReplyTopic(req.topic);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isChangeTopicMacro(req) {
  return req.macro && helpers.macro.isChangeTopic(req.macro);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isClosedCampaign(req) {
  return helpers.campaign.isClosedCampaign(req.campaign);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isMenuMacro(req) {
  return req.macro && helpers.macro.isMenu(req.macro);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function saidYes(req) {
  return req.askYesNoResponse === 'yes';
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function saidNo(req) {
  return req.askYesNoResponse === 'no';
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isLastOutboundAskContinue(req) {
  return helpers.template.isAskContinueTemplate(req.lastOutboundTemplate);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isLastOutboundAskSignup(req) {
  return helpers.template.isAskSignupTemplate(req.lastOutboundTemplate);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isLastOutboundTopicTemplate(req) {
  return helpers.template.isGambitCampaignsTemplate(req.lastOutboundTemplate);
}


/**
 * @param {Object} req
 * @return {Boolean}
 */
function isTopicChange(req) {
  return req.conversation.topic !== req.rivescriptReplyTopic;
}

/**
 * @param {Object} req
 * @param {Object} campaign
 */
function setCampaign(req, campaign) {
  req.campaign = campaign;
  if (campaign && campaign.id && !req.campaignId) {
    module.exports.setCampaignId(req, campaign.id);
  }
}

/**
 * @param {Object} req
 * @param {String} keyword
 */
function setKeyword(req, keyword) {
  req.keyword = keyword;
  analytics.addCustomAttributes({ keyword });
}

/**
 * @param {Object} req
 * @param {Object|String} topic
 */
function setTopic(req, topic) {
  req.topic = topic;
  const topicId = topic.id;
  // This check will be deprecated once broadcast content type is refactored to no longer
  // set a Rivescript topic string.
  if (!topicId) {
    return analytics.addCustomAttributes({ topic });
  }

  if (topic.campaign && !req.campaign) {
    module.exports.setCampaign(req, topic.campaign);
  }

  return analytics.addCustomAttributes({ topic: topicId });
}

/**
 * getUserIdParamFromReq - Gets the user id from the params sent inside the body of a POST request
 *
 * @param  {Object} req
 * @return {String}
 */
function getUserIdParamFromReq(req) {
  const body = req.body;
  /**
   * TODO: northstarId is deprecated in favor of userId. Remove it's check when Blink is updated to
   * use userId instead.
   */
  return body.userId || body.northstarId;
}

/**
 * Request helper
 */
module.exports = {
  changeTopic,
  changeTopicByCampaign,
  executeChangeTopicMacro,
  getCampaignActivityPayloadFromReq,
  getRivescriptReply,
  getUserIdParamFromReq,
  hasCampaign,
  isAutoReplyTopic,
  isChangeTopicMacro,
  isClosedCampaign,
  isLastOutboundAskContinue,
  isLastOutboundAskSignup,
  isLastOutboundTopicTemplate,
  isMenuMacro,
  isTopicChange,
  isTwilio: function isTwilio(req) {
    return req.query.origin === 'twilio';
  },
  parseAskYesNoResponse,
  postCampaignActivityFromReq,
  saidNo,
  saidYes,
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
  setTopic,
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
