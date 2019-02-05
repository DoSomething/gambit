'use strict';

const helpers = require('../helpers');
const logger = require('../logger');
const analytics = require('./analytics');
const config = require('../../config/lib/helpers/request');
const DraftSubmission = require('../../app/models/DraftSubmission');

/**
 * Sets the request topic and saves it as the request conversation topic.
 *
 * @param {Object} req
 * @param {Object} topic
 * @return {Promise}
 */
function changeTopic(req, topic) {
  module.exports.setTopic(req, topic);
  return (req.currentTopicId === topic.id) ? Promise.resolve() : req.conversation.setTopic(topic);
}

/**
 * @param {Object} req
 * @return {Promise}
 */
function createDraftSubmission(req) {
  return req.conversation.createDraftSubmission(req.topic.id);
}

/**
 * @param {Object} req
 * @return {Promise}
 */
function deleteDraftSubmission(req) {
  return DraftSubmission.deleteOne({ _id: req.draftSubmission._id });
}

/**
 * @param {Object} req
 * @param {Object} topic
 * @param {String} signupDetails
 * @return {Promise}
 */
async function executeInboundTopicChange(req, topic, signupDetails = null) {
  if (helpers.topic.hasActiveCampaign(topic)) {
    await helpers.user.fetchOrCreateSignup(req.user, topic.campaign, req.platform, signupDetails);
  }
  return module.exports.changeTopic(req, topic);
}

/**
 * @param {Object} req
 * @param {DraftSubmission} draftSubmission
 */
function getDraftSubmission(req) {
  return req.conversation.getDraftSubmission(req.topic.id);
}

/**
 * @param {Object} req
 * @return {Promise}
 */
async function getRivescriptReply(req) {
  const isRivescriptTopic = helpers.topic.isRivescriptTopicId(req.currentTopicId);
  // If Rivescript bot receives a message in a topic that it doesn't know about, it logs a
  // "User x was in an empty topic Y" message to the console. This avoids that message.
  const defaultTopicId = helpers.topic.getDefaultTopicId();
  const rivescriptTopicId = isRivescriptTopic ? req.currentTopicId : defaultTopicId;

  const reply = await helpers.rivescript
    .getBotReply(req.userId, rivescriptTopicId, req.inboundMessageText);

  // Check whether the bot reply is changing current topic.
  const didRivescriptTopicChange = isRivescriptTopic && reply.topicId !== req.currentTopicId;
  const didNonRivescriptTopicChange = !isRivescriptTopic && reply.topicId !== defaultTopicId;
  const newTopicId = didRivescriptTopicChange || didNonRivescriptTopicChange ? reply.topicId : null;

  return {
    text: reply.text,
    match: reply.match,
    topicId: newTopicId,
  };
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function hasCampaign(req) {
  return req.campaign && req.campaign.id;
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function hasDraftSubmission(req) {
  return !!req.draftSubmission;
}

/**
 * @param {Object} req
 * @param {String} key
 * @return {Boolean}
 */
function hasDraftSubmissionValue(req, key) {
  logger.debug('hasDraftSubmissionValue', { key }, req);
  return !!req.draftSubmission.values[key];
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
async function hasSignupWithWhyParticipated(req) {
  const signup = await helpers.user.fetchSignup(req.user, req.topic.campaign);
  return signup && signup.why_participated;
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
function isSubscriptionStatusActiveMacro(req) {
  return req.macro === helpers.macro.macros.subscriptionStatusActive();
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isSubscriptionStatusLessMacro(req) {
  return req.macro === helpers.macro.macros.subscriptionStatusLess();
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isSubscriptionStatusNeedMoreInfoMacro(req) {
  return req.macro === helpers.macro.macros.subscriptionStatusNeedMoreInfo();
}


/**
 * @param {Object} req
 * @return {Boolean}
 */
function isSubscriptionStatusStopMacro(req) {
  return req.macro === helpers.macro.macros.subscriptionStatusStop();
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isStartCommand(req) {
  if (!req.inboundMessageText) {
    return false;
  }
  return req.inboundMessageText.trim().toLowerCase() === config.commands.start;
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isTwilio(req) {
  return req.query.origin === config.origin.twilio || module.exports.isTwilioStudio(req);
}

/**
 * @param {Object} req
 * @return {Boolean}
 */
function isTwilioStudio(req) {
  return req.query.origin === config.origin.twilioStudio;
}

/**
 * Updates req.macro per askSubscriptionStatus topic reply.
 *
 * @async
 * @param {Object} req
 * @return {Promise}
 */
async function parseAskSubscriptionStatusResponse(req) {
  // This gets called within the catchAll after we've already created an inbound message.
  const macroName = await helpers.rivescript
    .parseAskSubscriptionStatusResponse(req.inboundMessage.text);

  module.exports.setMacro(req, macroName);
  // Overwrite the current 'catchAll' macro value with the askSubscriptionStatus reply.
  await req.inboundMessage.updateMacro(macroName);
}

/**
 * Sets req.macro per askVotingStatus topic reply.
 *
 * @async
 * @param {Object} req
 * @return {Promise}
 */
async function parseAskVotingPlanStatusResponse(req) {
  // This gets called within the catchAll after we've already created an inbound message.
  const macroName = await helpers.rivescript
    .parseAskVotingPlanStatusResponse(req.inboundMessage.text);

  module.exports.setMacro(req, macroName);
  // Overwrite the current 'catchAll' value with our voting status macro.
  await req.inboundMessage.updateMacro(macroName);
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
 * @param {String} key
 * @param {Number|String} value
 * @return {Promise}
 */
function saveDraftSubmissionValue(req, key, value) {
  const keyValuePair = {};
  keyValuePair[key] = value;
  req.draftSubmission.values = Object.assign(req.draftSubmission.values, keyValuePair);
  req.draftSubmission.markModified('values');
  return req.draftSubmission.save();
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
 * @param {DraftSubmission} draftSubmission
 */
function setDraftSubmission(req, draftSubmission) {
  req.draftSubmission = draftSubmission;
  analytics.addCustomAttributes({ draftSubmissionId: draftSubmission.id });
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
 * setBroadcastId - Sets req.broadcastId value
 *
 * @param {Request} req
 * @param {String} broadcastId
 */
function setBroadcastId(req, broadcastId) {
  req.broadcastId = broadcastId;
  analytics.addCustomAttributes({ broadcastId });
}

/**
 * setMobileNumber - Sets req.mobileNumber value
 *
 * @param {Request} req
 * @param {String} mobileNumber
 */
function setMobileNumber(req, mobileNumber) {
  req.mobileNumber = mobileNumber;
  analytics.addCustomAttributes({ mobileNumber });
}

/**
 * setSuppressOutbound
 * @param {Request} req
 */
function setSuppressOutbound(req) {
  const suppressOutbound = true;
  req.suppressOutbound = suppressOutbound;
  analytics.addCustomAttributes({ suppressOutbound });
}

/**
 * Request helper
 */
module.exports = {
  changeTopic,
  createDraftSubmission,
  deleteDraftSubmission,
  executeInboundTopicChange,
  getDraftSubmission,
  getRivescriptReply,
  getUserIdParamFromReq,
  hasCampaign,
  hasDraftSubmission,
  hasDraftSubmissionValue,
  hasSignupWithWhyParticipated,
  isClosedCampaign,
  isSaidNoMacro,
  isSaidYesMacro,
  isStartCommand,
  isSubscriptionStatusActiveMacro,
  isSubscriptionStatusLessMacro,
  isSubscriptionStatusNeedMoreInfoMacro,
  isSubscriptionStatusStopMacro,
  isTwilio,
  isTwilioStudio,
  parseAskSubscriptionStatusResponse,
  parseAskVotingPlanStatusResponse,
  parseAskYesNoResponse,
  saveDraftSubmissionValue,
  setBroadcastId,
  setMobileNumber,
  setCampaign,
  setSuppressOutbound,
  setCampaignId: function setCampaignId(req, campaignId) {
    req.campaignId = Number(campaignId);
    analytics.addCustomAttributes({ campaignId });
  },
  setConversation,
  setDraftSubmission,
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
    // x-gambit-outbound-reply-suppress is sent by Consolebot
    return req.headers['x-gambit-outbound-reply-suppress'] === 'true' || !!req.suppressOutbound;
  },
};
