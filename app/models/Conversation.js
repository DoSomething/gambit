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
  medium: String,
  userId: String,
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
    userId: req.userId,
    medium: req.platform,
    paused: false,
    topic: defaultTopic,
  };

  if (req.slackChannel) {
    data.slackChannel = req.slackChannel;
  }

  return this.create(data);
};

/**
 * @param {string} userId
 * TODO: Query by medium + userId. For now, we know we won't overlap phone + slackId + facebookId
 * @return {Promise}
 */
conversationSchema.statics.findByUserId = function (userId) {
  const query = { userId };
  logger.trace('Conversation.findByUserId', query);

  return this.findOne(query)
    .then(convo => convo)
    .catch(err => err);
};

/**
 * Update topic and check whether to toggle paused.
 * @return {boolean}
 */
conversationSchema.methods.setTopic = function (newTopic) {
  logger.trace('Conversation.setTopic', { newTopic });

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
  this.save();
};

conversationSchema.methods.getMessagePayload = function () {
  return {
    userId: this.userId,
    campaignId: this.campaignId,
    topic: this.topic,
    conversation: this,
  };
};

conversationSchema.methods.createInboundMessage = function (req) {
  const message = this.getMessagePayload();
  message.text = req.inboundMessageText;
  message.direction = 'inbound';
  message.attachments = req.attachments;

  // TODO: Handle platform dependent message properties here

  return Messages.create(message);
};

conversationSchema.methods.createOutboundReplyMessage = function (messageText, messageTemplate) {
  const message = this.getMessagePayload();
  message.text = messageText;
  message.template = messageTemplate;
  message.direction = 'outbound-reply';

  this.lastOutboundTemplate = messageTemplate;
  return this.save().then(() => Messages.create(message));
};

conversationSchema.methods.createOutboundSendMessage = function (messageText, messageTemplate) {
  const message = this.getMessagePayload();
  message.text = messageText;
  message.template = messageTemplate;
  message.direction = 'outbound-api-send';

  this.lastOutboundTemplate = messageTemplate;
  return this.save().then(() => Messages.create(message));
};

conversationSchema.methods.createOutboundImportMessage = function (messageText, messageTemplate) {
  const message = this.getMessagePayload();
  message.text = messageText;
  message.template = messageTemplate;
  message.direction = 'outbound-api-import';

  this.lastOutboundTemplate = messageTemplate;
  return this.save().then(() => Messages.create(message));
};

/**
 * Sends the given messageText to the User via posting to their platform.
 * @param {Message} message
 * @args {object} args
 */
conversationSchema.methods.sendMessage = function (message) {
  logger.debug('conversation.sendMessage');

  const messageText = message.text;

  if (this.medium === 'slack') {
    slack.postMessage(this.slackChannel, messageText);
  }
  if (this.medium === 'sms') {
    twilio.postMessage(this.userId, messageText);
  }
  if (this.medium === 'facebook') {
    facebook.postMessage(this.userId, messageText);
  }
};

module.exports = mongoose.model('conversations', conversationSchema);
