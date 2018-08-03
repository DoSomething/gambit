'use strict';

const helpers = require('../helpers');
const gambitCampaigns = require('../gambit-campaigns');
const logger = require('../logger');
const analytics = require('./analytics');

/**
 * Updates conversation with given topic, and updates user subscription status to pending if
 * the new topic is an askSubscriptionStatus.
 *
 * @param {Object} req
 * @param {Object} topic
 * @return {Promise}
 */
function changeTopic(req, topic) {
  module.exports.setTopic(req, topic);
  const topicId = topic.id;
  let promise = Promise.resolve();
  if (req.currentTopicId === topicId) {
    return promise;
  }
  if (helpers.topic.isAskSubscriptionStatus(topic) && req.userId) {
    promise = helpers.user.setPendingSubscriptionStatusForUserId(req.userId);
  }
  return req.conversation.setTopic(topic);
}

/**
 * @param {Object} req
 * @param {Object} campaign
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
  const topicId = req.rivescriptReplyTopic.id;
  logger.info('executeChangeTopicMacro', { topicId, userId: req.userId });
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
 * @return {Promise}
 */
function getRivescriptReply(req) {
  return helpers.rivescript.getBotReply(req.userId, req.currentTopicId, req.inboundMessageText)
    .then(res => ({
      text: res.text,
      match: res.match,
      topic: helpers.topic.getRivescriptTopicById(res.topicId),
    }));
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
function isSaidNoMacro(req) {
  return req.macro && helpers.macro.isSaidNo(req.macro);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isSaidYesMacro(req) {
  return req.macro && helpers.macro.isSaidYes(req.macro);
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
 * Updates req.macro to saidYes or saidNo if inbound message can be parsed as either.
 *
 * @async
 * @param {Object} req
 * @return {Promise}
 */
async function parseAskYesNoResponse(req) {
  // This gets called within the catchAll after we've already created an inbound message.
  const macroName = await helpers.rivescript.parseAskYesNoResponse(req.inboundMessage.text);
  if (helpers.macro.isSaidYes(macroName) || helpers.macro.isSaidNo(macroName)) {
    module.exports.setMacro(req, macroName);
    // Overwrite the current 'catchAll' value as our saidYes or saidNo macro.
    await req.inboundMessage.updateMacro(macroName);
  }
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
 * @param {Conversation} conversation
 */
function setConversation(req, conversation) {
  req.conversation = conversation;
  req.currentTopicId = conversation.topic;
  analytics.addCustomAttributes({
    conversationId: conversation.id,
    currentTopicId: req.currentTopicId,
  });
  const lastOutboundMessage = conversation.lastOutboundMessage;
  if (lastOutboundMessage) {
    module.exports.setLastOutboundMessage(req, lastOutboundMessage);
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
 * @param {String} macro
 */
function setMacro(req, macro) {
  req.macro = macro;
  analytics.addCustomAttributes({ macro });
}

/**
 * @param {Object} req
 * @param {Object} topic
 */
function setTopic(req, topic) {
  req.topic = topic;
  analytics.addCustomAttributes({ topicId: topic.id });
  if (topic.campaign && !req.campaign) {
    module.exports.setCampaign(req, topic.campaign);
  }
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
  isSaidNoMacro,
  isSaidYesMacro,
  isTwilio: function isTwilio(req) {
    return req.query.origin === 'twilio';
  },
  parseAskYesNoResponse,
  postCampaignActivityFromReq,
  setBroadcastId: function setBroadcastId(req, broadcastId) {
    req.broadcastId = broadcastId;
    analytics.addCustomAttributes({ broadcastId });
  },
  setCampaign,
  setCampaignId: function setCampaignId(req, campaignId) {
    req.campaignId = campaignId;
    analytics.addCustomAttributes({ campaignId });
  },
  setConversation,
  setKeyword,
  setLastOutboundMessage: function setLastOutboundMessage(req, message) {
    req.lastOutboundTemplate = message.template;
    req.lastOutboundBroadcastId = message.broadcastId;
    analytics.addCustomAttributes({
      lastOutboundTemplate: req.lastOutboundTemplate,
      lastOutboundBroadcastId: req.lastOutboundBroadcastId,
    });
  },
  setMacro,
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
