'use strict';

const mongoose = require('mongoose');
const logger = require('heroku-logger');
const Messages = require('./Message');
const slack = require('../../lib/slack');

const defaultTopic = 'random';

/**
 * Schema.
 */
const userSchema = new mongoose.Schema({
  _id: String,
  platform: String,
  platformId: String,
  paused: Boolean,
  topic: String,
  campaignId: Number,
  signupStatus: String,
  lastReplyTemplate: String,
  slackChannel: String,
});

/**
 * @param {Object} req - Express request
 * @return {Promise}
 */
userSchema.statics.createFromReq = function (req) {
  const data = {
    _id: new Date().getTime(),
    platformId: req.platformUserId,
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
 * @param {string} platform
 * @param {string} platformId
 * @return {Promise}
 */
userSchema.statics.findByPlatformId = function (platform, platformId) {
  const query = { platform, platformId };
  logger.trace('User.findByPlatformId', query);

  return this.findOne(query)
    .then(user => user)
    .catch(err => err);
};

/**
 * Update User topic and check whether to toggle paused.
 * @return {boolean}
 */
userSchema.methods.updateUserTopic = function (newTopic) {
  logger.trace('User.updateUserTopic', { newTopic });

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
userSchema.methods.supportResolved = function () {
  this.lastReplyTemplate = 'front';

  return this.updateUserTopic(defaultTopic);
};

/**
 * Returns save of User for updating given Campaign and its topic.
 * @param {Campaign} campaign
 * @return {Promise}
 */
userSchema.methods.setCampaign = function (campaign, signupStatus) {
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
userSchema.methods.signupForCampaign = function (campaign) {
  this.setCampaign(campaign, 'doing');
};

/**
 * Prompt signup for current campaign.
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
userSchema.methods.promptSignupForCampaign = function (campaign) {
  this.setCampaign(campaign, 'prompt');
};

/**
 * Decline signup for current campaign.
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
userSchema.methods.declineSignup = function () {
  this.signupStatus = 'declined';
  this.save();
};

userSchema.methods.getMessagePayload = function () {
  return {
    userId: this._id,
    campaignId: this.campaignId,
    topic: this.topic,
  };
};

userSchema.methods.createInboundMessage = function (messageText) {
  const message = this.getMessagePayload();
  message.text = messageText;
  message.direction = 'inbound';

  return Messages.create(message);
};

userSchema.methods.createOutboundReplyMessage = function (messageText, messageTemplate) {
  const message = this.getMessagePayload();
  message.text = messageText;
  message.template = messageTemplate;
  message.direction = 'outbound-reply';

  return Messages.create(message);
};

userSchema.methods.createOutboundSendMessage = function (messageText, messageTemplate) {
  const message = this.getMessagePayload();
  message.text = messageText;
  message.template = messageTemplate;
  message.direction = 'outbound-api-send';

  return Messages.create(message);
};

/**
 * Sends the given messageText to the User via posting to their platform.
 * @param {string} messageText
 * @args {object} args
 */
userSchema.methods.sendMessage = function (messageText, args) {
  if (this.platform !== 'slack') {
    return;
  }

  slack.postMessage(this.slackChannel, messageText, args);
};

module.exports = mongoose.model('users', userSchema);
