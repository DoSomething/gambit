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
  lastOutboundMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
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
  const query = { platformUserId: req.platformUserId };
  logger.trace('Conversation.getFromReq', query);

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
  return this.setTopic(defaultTopic);
};

/**
 * Returns save of User for updating given Campaign and its topic.
 * @param {Campaign} campaign
 * @return {Promise}
 */
conversationSchema.methods.setCampaignWithSignupStatus = function (campaign, signupStatus) {
  this.campaignId = campaign._id;
  this.signupStatus = signupStatus;
  logger.debug('setCampaignWithSignupStatus', { campaign: this.campaignId, signupStatus });

  return this.setTopic(campaign.topic);
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
conversationSchema.methods.getMessagePayloadFromReq = function (req = {}) {
  // TODO: Handle platform dependent message properties here
  const data = {
    metadata: req.metadata || {},
    attachments: req.attachments || [],
  };
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
  logger.debug('createMessage', { direction });

  const data = {
    text,
    direction,
    template,
  };

  // Merge default payload and payload from req
  Object.assign(data, this.getDefaultMessagePayload(), this.getMessagePayloadFromReq(req));

  return Messages.create(data);
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
    .then((message) => {
      this.lastOutboundMessage = message;

      return this.save();
    })
    .then(() => this.populate('lastOutboundMessage').execPopulate());
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
 * @param {string} text
 * @param {string} template
 * @return {Promise}
 */
conversationSchema.methods.createAndPostOutboundSendMessage = function (text, template, req) {
  return this.createLastOutboundMessage('outbound-api-send', text, template, req)
    .then(() => this.postLastOutboundMessageToPlatform());
};

/**
 * @param {string} text
 * @param {string} template
 * @return {Promise}
 */
conversationSchema.methods.createOutboundImportMessage = function (text, template, req) {
  return this.createLastOutboundMessage('outbound-api-import', text, template, req);
};

/**
 * Posts the Last Outbound Message to the platform.
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

  if (this.platform === 'facebook') {
    facebook.postMessage(this.platformUserId, messageText);
  }
};

module.exports = mongoose.model('Conversation', conversationSchema);
