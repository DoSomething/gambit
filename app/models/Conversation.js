'use strict';

const mongoose = require('mongoose');
const logger = require('heroku-logger');

const Messages = require('./Message');
const facebook = require('../../lib/facebook');
const slack = require('../../lib/slack');
const twilio = require('../../lib/twilio');

const defaultTopic = 'random';

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
  lastOutboundTemplate: String,
  slackChannel: String,
  lastBroadcastId: String,
}, { timestamps: true });

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
  const query = {
    platformUserId: req.platformUserId,
    platform: req.platform,
  };
  logger.trace('Conversation.getFromReq', query);

  return this.findOne(query);
};

/**
 * Update topic and check whether to toggle paused.
 * @return {boolean}
 */
conversationSchema.methods.setTopic = function (newTopic) {
  if (this.topic === newTopic) {
    return this.save();
  }

  const supportTopic = 'support';

  if (this.topic === supportTopic && newTopic !== supportTopic) {
    this.paused = false;
  }

  if (this.topic !== supportTopic && newTopic === supportTopic) {
    this.paused = true;
  }

  this.topic = newTopic;
  logger.trace('Conversation.setTopic', { newTopic });

  return this.save();
};

/**
 * Set topic to random to upause User.
 */
conversationSchema.methods.supportResolved = function () {
  this.lastOutboundTemplate = 'front';

  return this.setTopic(defaultTopic);
};

/**
 * Returns save of User for updating given Campaign and its topic.
 * @param {Campaign} campaign
 * @return {Promise}
 */
conversationSchema.methods.setCampaignWithSignupStatus = function (campaign, signupStatus) {
  this.topic = campaign.topic;
  this.campaignId = campaign._id;
  this.signupStatus = signupStatus;

  return this.save();
};

/**
 * Post signup for current campaign and set it as the topic.
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
conversationSchema.methods.setCampaign = function (campaign) {
  this.setCampaignWithSignupStatus(campaign, 'doing');
};

/**
 * Prompt signup for current campaign.
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
conversationSchema.methods.promptSignupForCampaign = function (campaign) {
  this.setCampaignWithSignupStatus(campaign, 'prompt');
};

/**
 * Prompt signup for current campaign and broadcast
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
conversationSchema.methods.promptSignupForBroadcast = function (campaign, broadcastId) {
  this.lastBroadcastId = broadcastId;
  this.setCampaignWithSignupStatus(campaign, 'prompt');
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

conversationSchema.methods.getMessagePayload = function (req = {}) {
  return {
    conversationId: this,
    campaignId: this.campaignId,
    topic: this.topic,
    metadata: req.metadata,
  };
};

conversationSchema.methods.loadInboundMessageAndUpdateMetadataByRequestId = function (requestId,
  metadata = {}) {
  const query = {
    conversationId: this._id,
    'metadata.requestId': requestId,
    direction: 'inbound',
  };
  const update = { metadata };
  const options = { new: true };
  return Messages.findOneAndUpdate(query, update, options);
};

conversationSchema.methods.loadOutboundMessageAndUpdateMetadataByRequestId = function (requestId,
  metadata = {}) {
  const query = {
    conversationId: this._id,
    'metadata.requestId': requestId,
    direction: { $regex: /^outbound.*/i },
  };
  const update = { metadata };
  const options = { new: true };
  return Messages.findOneAndUpdate(query, update, options);
};

conversationSchema.methods.createInboundMessage = function (req) {
  const message = this.getMessagePayload(req);
  message.text = req.inboundMessageText;
  message.direction = 'inbound';
  // TODO: attachments should be default in the getMessagePayload method, because we will eventually
  // have attachments for outbound messages too
  message.attachments = req.attachments;

  // TODO: Handle platform dependent message properties here

  return Messages.create(message);
};

/**
 * Creates outbound-reply Message with given messageText and messageTemplate.
 */
conversationSchema.methods.createOutboundReplyMessage = function (messageText, messageTemplate,
  req) {
  const message = this.getMessagePayload(req);
  message.text = messageText;
  message.template = messageTemplate;
  message.direction = 'outbound-reply';

  this.lastOutboundTemplate = messageTemplate;
  return this.save().then(() => Messages.create(message));
};

conversationSchema.methods.createOutboundSendMessage = function (messageText, messageTemplate,
  req) {
  const message = this.getMessagePayload(req);
  message.text = messageText;
  message.template = messageTemplate;
  message.direction = 'outbound-api-send';

  this.lastOutboundTemplate = messageTemplate;
  return this.save().then(() => Messages.create(message));
};

conversationSchema.methods.createOutboundImportMessage = function (messageText, messageTemplate,
  req) {
  const message = this.getMessagePayload(req);
  message.text = messageText;
  message.template = messageTemplate;
  message.direction = 'outbound-api-import';

  this.lastOutboundTemplate = messageTemplate;
  return this.save().then(() => Messages.create(message));
};

/**
 * Sends the given outboundMessage to the User via posting to their platform.
 * @param {Message} outboundMessage
 * @args {object} args
 */
conversationSchema.methods.postMessageToPlatform = function (outboundMessage) {
  const loggerMessage = 'conversation.postMessageToPlatform';
  const messageText = outboundMessage.text;
  logger.debug(loggerMessage, { messageText });

  if (this.platform === 'slack') {
    slack.postMessage(this.slackChannel, messageText);
  }

  if (this.platform === 'sms') {
    twilio.postMessage(this.platformUserId, messageText)
      .then(res => logger.debug(loggerMessage, { status: res.status }))
      .catch(err => logger.error(loggerMessage, err));
  }

  if (this.platform === 'facebook') {
    facebook.postMessage(this.platformUserId, messageText);
  }
};

module.exports = mongoose.model('conversations', conversationSchema);
