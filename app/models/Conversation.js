'use strict';

const mongoose = require('mongoose');
const logger = require('../../lib/logger');
const Promise = require('bluebird');

const Messages = require('./Message');
const northstar = require('../../lib/northstar');
const slack = require('../../lib/slack');
const twilio = require('../../lib/twilio');
const UnprocessibleEntityError = require('../../app/exceptions/UnprocessibleEntityError');

const campaignTopic = 'campaign';
const defaultTopic = 'random';
const supportTopic = 'support';

/**
 * Schema.
 */
const conversationSchema = new mongoose.Schema({
  platform: String,
  platformUserId: {
    type: String,
    index: true,
  },
  paused: Boolean,
  topic: String,
  campaignId: Number,
  signupStatus: String,
  lastOutboundMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  slackChannel: String,
}, { timestamps: true });

conversationSchema.index({ createdAt: 1 });
conversationSchema.index({ updatedAt: 1 });

/**
 * @param {Object} req - Express request
 * @return {Promise}
 */
conversationSchema.statics.createFromReq = function (req) {
  const data = {
    platformUserId: req.platformUserId,
    platform: req.platform,
    paused: false,
    topic: defaultTopic,
  };

  if (req.slackChannel) {
    data.slackChannel = req.slackChannel;
  }

  return this.create(data);
};

/**
 * @param {Object} req - Express request
 * @return {Promise}
 */
conversationSchema.statics.getFromReq = function (req) {
  const query = { platformUserId: req.platformUserId };
  logger.debug('Conversation.getFromReq', query, req);

  return this.findOne(query).populate('lastOutboundMessage');
};

/**
 * Update topic and check whether to toggle paused.
 * @return {boolean}
 */
conversationSchema.methods.setTopic = function (newTopic) {
  if (this.topic === newTopic) {
    return this.save();
  }

  if (this.topic === supportTopic && newTopic !== supportTopic) {
    this.paused = false;
  }

  if (this.topic !== supportTopic && newTopic === supportTopic) {
    this.paused = true;
  }

  this.topic = newTopic;
  logger.debug('Conversation.setTopic', { newTopic });

  return this.save();
};

/**
 * Set topic to support to pause User.
 */
conversationSchema.methods.supportRequested = function () {
  return this.setTopic(supportTopic);
};

/**
 * Set topic to random to upause User.
 */
conversationSchema.methods.supportResolved = function () {
  return this.setTopic(defaultTopic);
};

/**
 * Returns save of User for updating given Campaign and its topic.
 * TODO: We may want to refactor to just pass a campaignId. We were initially passing a campaign
 * model to set Conversation.topic (if Campaign had its own Rivescript topic defined).
 *
 * @param {Campaign} campaign
 * @return {Promise}
 */
conversationSchema.methods.setCampaignWithSignupStatus = function (campaign, signupStatus) {
  this.campaignId = campaign.id;
  this.signupStatus = signupStatus;
  logger.debug('setCampaignWithSignupStatus', { campaign: this.campaignId, signupStatus });

  return this.setCampaignTopic();
};

/**
 * Post signup for current campaign and set it as the topic.
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
conversationSchema.methods.setCampaign = function (campaign) {
  return this.setCampaignWithSignupStatus(campaign, 'doing');
};

/**
 * Sets the Conversation topic to campaignTopic to enable Campaign Rivescript triggers.
 */
conversationSchema.methods.setCampaignTopic = function () {
  return this.setTopic(campaignTopic);
};

/**
 * Prompt signup for current campaign.
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
conversationSchema.methods.promptSignupForCampaign = function (campaign) {
  return this.setCampaignWithSignupStatus(campaign, 'prompt');
};

/**
 * Decline signup for current campaign.
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
conversationSchema.methods.declineSignup = function () {
  this.signupStatus = 'declined';
  return this.save();
};

/**
 * Gets data for a Conversation Message.
 * @param {string} text
 * @param {string} template
 * @return {object}
 */
conversationSchema.methods.getDefaultMessagePayload = function (text, template) {
  const data = {
    conversationId: this,
    campaignId: this.campaignId,
    topic: this.topic,
  };
  if (text) {
    data.text = text;
  }
  if (template) {
    data.template = template;
  }
  return data;
};

/**
 * Gets data from a req object for a Conversation Message.
 * @param {string} text
 * @param {string} template
 * @return {object}
 */
conversationSchema.methods.getMessagePayloadFromReq = function (req = {}, direction = '') {
  let broadcastId = null;

  // Attachments are stored in sub objects named according to the direction of the message
  // 'inbound' or 'outbound'
  const isOutbound = direction.includes('outbound');
  const attachmentDirection = isOutbound ? 'outbound' : 'inbound';

  if (req.broadcastId) {
    broadcastId = req.broadcastId;
  // Set broadcastId when this is an inbound message responding to an outbound broadcast:
  } else if (direction === 'inbound') {
    broadcastId = req.lastOutboundBroadcastId;
  }

  // TODO: Handle platform dependent message properties here
  const data = {
    broadcastId,
    metadata: req.metadata || {},
    attachments: req.attachments[attachmentDirection] || [],
  };

  // Add extras if present.
  if (req.platformMessageId) {
    data.platformMessageId = req.platformMessageId;
  }
  if (req.agentId) {
    data.agentId = req.agentId;
  }
  if (req.rivescriptMatch) {
    data.match = req.rivescriptMatch;
  }
  if (req.macro) {
    data.macro = req.macro;
  }
  return data;
};


/**
 * Creates Message for a Conversation with given params.
 * @param {string} direction
 * @param {string} text
 * @param {string} template
 * @param {array} attachments
 * @return {Promise}
 */
conversationSchema.methods.createMessage = function (direction, text, template, req) {
  logger.debug('createMessage', { direction }, req);

  const data = {
    text,
    direction,
    template,
  };

  // Merge default payload and payload from req
  const defaultPayload = this.getDefaultMessagePayload();
  Object.assign(data, defaultPayload, this.getMessagePayloadFromReq(req, direction));

  return Messages.create(data);
};


/**
 * Sets and populates lastOutboundMessage for this conversation
 *
 * @param  {object} outboundMessage
 * @return {promise}
 */
conversationSchema.methods.setLastOutboundMessage = function (outboundMessage) {
  this.lastOutboundMessage = outboundMessage;
  return this.save()
    .then(() => this.populate('lastOutboundMessage').execPopulate());
};

/**
 * Creates Message with given params and saves it to lastOutboundMessage.
 * @param {string} direction
 * @param {string} text
 * @param {string} template
 * @return {Promise}
 */
conversationSchema.methods.createLastOutboundMessage = function (direction, text, template, req) {
  return this.createMessage(direction, text, template, req)
    .then(message => this.setLastOutboundMessage(message));
};

/**
 * @param {string} text
 * @param {string} template
 * @return {Promise}
 */
conversationSchema.methods.createAndPostOutboundReplyMessage = function (text, template, req) {
  return this.createLastOutboundMessage('outbound-reply', text, template, req)
    .then(() => this.postLastOutboundMessageToPlatform());
};

/**
 * Posts the Last Outbound Message to the platform.
 * TODO: Promisify, look for request success status when posting to platforms
 */
conversationSchema.methods.postLastOutboundMessageToPlatform = function () {
  const loggerMessage = 'conversation.postLastOutboundMessageToPlatform';
  const messageText = this.lastOutboundMessage.text;
  // This could be blank for noReply templates.
  if (!messageText) {
    return;
  }

  logger.debug(loggerMessage);

  if (this.platform === 'slack') {
    slack.postMessage(this.slackChannel, messageText);
  }

  if (this.platform === 'sms') {
    twilio.postMessage(this.platformUserId, messageText)
      .then(res => logger.debug(loggerMessage, { status: res.status }))
      .catch(err => logger.error(loggerMessage, err));
  }
};

/**
 * @return {Promise}
 */
conversationSchema.methods.getNorthstarUser = function () {
  if (this.platform === 'slack') {
    return slack.fetchSlackUserBySlackId(this.platformUserId)
      .then(slackUser => northstar.fetchUserByEmail(slackUser.profile.email))
      .catch(err => err);
  }

  return northstar.fetchUserByMobile(this.platformUserId);
};

/**
 * @return {Promise}
 */
conversationSchema.methods.createNorthstarUser = function () {
  // For now, we only need to support creating new Users by a mobile number.
  if (this.platform === 'sms' || this.platform === 'api') {
    return northstar.createUserForMobile(this.platformUserId);
  }

  const errorMsg = `createNorthstarUser: Creating Northstar users is not supported in ${this.platform} platform.`;
  const error = new UnprocessibleEntityError(errorMsg);
  return Promise.reject(error);
};

module.exports = mongoose.model('Conversation', conversationSchema);
