'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');
const moment = require('moment');

const logger = require('../../lib/logger');
const Message = require('./Message');
const helpers = require('../../lib/helpers');
const front = require('../../lib/front');
const twilio = require('../../lib/twilio');

const config = require('../../config/app/models/conversation');

/**
 * Schema.
 */
const conversationSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true,
  },
  platform: String,
  platformUserId: {
    type: String,
    index: true,
  },
  topic: String,
  campaignId: Number,
  signupStatus: String,
  lastOutboundMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
}, { timestamps: true });

conversationSchema.index({ createdAt: 1 });
conversationSchema.index({ updatedAt: 1 });
conversationSchema.index({ userId: 1, platform: 1 });

/**
 * @param {Object} req - Express request
 * @return {Promise}
 */
conversationSchema.statics.createFromReq = function (req) {
  const data = {
    userId: req.userId,
    platform: req.platform,
    platformUserId: req.platformUserId,
    topic: config.topics.default,
  };

  return this.create(data);
};

/**
 * @param {Object} req - Express request
 * @return {Promise}
 */
conversationSchema.statics.getFromReq = function (req) {
  const queryByUserId = { userId: req.userId, platform: req.platform };

  return this.findOneAndPopulateLastOutboundMessage(queryByUserId, req)
    .then((conversation) => {
      if (conversation) {
        return Promise.resolve(conversation);
      }
      // Have we already saved a Conversation for this User before we added userId?
      // TODO: Remove this when all Conversations have been backfilled with userId.
      const queryByPlatformUserId = { platform: 'sms', platformUserId: req.platformUserId };
      return this.findOneAndPopulateLastOutboundMessage(queryByPlatformUserId, req);
    });
};

/**
 * @param {Object} query - Mongoose query object
 * @param {Object} req - Express request
 * @return {Promise}
 */
conversationSchema.statics.findOneAndPopulateLastOutboundMessage = function (query, req) {
  logger.debug('Conversation.findOne', query, req);
  return this.findOne(query).populate('lastOutboundMessage');
};

/**
 * Set topic property.
 * @param {String} topic
 * @param {Number} campaignId
 * @return {Promise}
 */
conversationSchema.methods.updateTopicAndCampaignId = function (topic, campaignId) {
  logger.debug('updateTopicAndCampaignId', { topic, campaignId });
  this.campaignId = campaignId;
  this.topic = topic;
  return this.save();
};

/**
 * Set topic property.
 * @param {String} topic
 * @return {Promise}
 */
conversationSchema.methods.setTopic = function (topic) {
  if (topic === this.topic) {
    return Promise.resolve();
  }
  logger.debug('Conversation.setTopic', { topic });
  this.topic = topic;
  return this.save();
};

/**
 * @return {Promise}
 */
conversationSchema.methods.setDefaultTopic = function () {
  return this.setTopic(config.topics.default);
};

/**
 * @return {Promise}
 */
conversationSchema.methods.setCampaignTopic = function () {
  return this.setTopic(config.topics.campaign);
};

/**
 * @return {Promise}
 */
conversationSchema.methods.setSupportTopic = function () {
  return this.setTopic(config.topics.support);
};

/**
 * Returns save of User for updating given Campaign and its topic.
 * TODO: Refactor to just pass a campaignId. We were initially passing a campaign
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
    userId: this.userId,
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
 * TODO: refactor to use the req.inbound and req.outbound properties
 * @param {string} text
 * @param {string} template
 * @return {object}
 */
conversationSchema.methods.getMessagePayloadFromReq = function (req = {}, direction = '') {
  let broadcastId = null;

  // Attachments are stored in sub objects named according to the direction of the message
  // 'inbound' or 'outbound'
  const isOutbound = direction.includes('outbound');
  const isInbound = !isOutbound;
  const attachmentDirection = isOutbound ? 'outbound' : 'inbound';

  // Should only exist in outbound broadcast messages
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
    attachments: req.attachments ? req.attachments[attachmentDirection] : [],
  };

  // Add extras if present.

  // If inbound message and includes platformMessageId
  if (isInbound && req.platformMessageId) {
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
  let messageText;
  if (direction !== 'inbound') {
    messageText = helpers.tags.render(text, req);
  } else {
    messageText = text;
  }

  const data = {
    text: messageText,
    direction,
    template,
  };

  // Merge default payload and payload from req
  const defaultPayload = this.getDefaultMessagePayload();
  Object.assign(data, defaultPayload, this.getMessagePayloadFromReq(req, direction));

  return Message.create(data);
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
conversationSchema.methods.createAndSetLastOutboundMessage = function (direction, text, template, req) { // eslint-disable-line max-len
  return this.createMessage(direction, text, template, req)
    .then((message) => {
      logger.debug('created message', { messageId: message.id }, req);
      // Backfill Conversations that may not have userId set.
      if (!this.userId) {
        logger.debug('Backfilling Conversation.userId', {
          userId: req.userId,
          conversationId: this.id,
        }, req);
        this.userId = req.userId;
      }
      return this.setLastOutboundMessage(message);
    });
};

/**
 * Posts the Last Outbound Message to Twilio for SMS conversations.
 */
conversationSchema.methods.postLastOutboundMessageToPlatform = function (req) {
  const messageText = this.lastOutboundMessage.text;

  if (!messageText || !this.isSms()) {
    return Promise.resolve();
  }

  const mediaUrl = this.lastOutboundMessage.attachments.map(attachment => attachment.url);

  return new Promise((resolve, reject) => {
    twilio.postMessage(req.platformUserId, messageText, mediaUrl)
      .then((twilioRes) => {
        const sid = twilioRes.sid;
        const status = twilioRes.status;
        logger.debug('twilio.postMessage', { sid, status }, req);

        // @see https://www.twilio.com/docs/api/messaging/message#resource-properties
        this.lastOutboundMessage.platformMessageId = sid;
        this.lastOutboundMessage.metadata.delivery.queuedAt = twilioRes.dateCreated;
        this.lastOutboundMessage.metadata.delivery.totalSegments = twilioRes.numSegments;
        return resolve(this.lastOutboundMessage.save());
      })
      .catch((error) => {
        /**
         * Save failure metadata before bubbling the error up the Promise chain when the error is
         * an unrecoverable error, since retries are suppressed when they are detected.
         */
        if (helpers.twilio.isBadRequestError(error)) {
          this.lastOutboundMessage.metadata.delivery.failedAt = moment().format();
          this.lastOutboundMessage.metadata.delivery.failureData = {
            code: error.code,
            message: error.message,
          };
          this.lastOutboundMessage.save()
            .then(() => reject(error))
            .catch((saveError) => {
              logger.error(
                'twilio.postMessage error: this.lastOutboundMessage.save() failed',
                saveError, req);
              reject(error);
            });
        } else {
          /**
           * Bubble up error so we can either suppress (unrecoverable error) or retry.
           */
          reject(error);
        }
      });
  });
};

/**
 * Posts the given Message from User to Support inbox for SMS conversations.
 */
conversationSchema.methods.postMessageToSupport = function (req, message) {
  if (!this.isSms()) {
    logger.debug('Support not available for platform.', { platform: this.platform }, req);
    return Promise.resolve();
  }

  return front.postMessage(req.userId, message.text)
    .then((res) => {
      logger.debug('front.postMessage response', { body: res.body }, req);
      return res;
    });
};

/**
 * @return {boolean}
 */
conversationSchema.methods.isSms = function () {
  return this.platform === 'sms';
};

/**
 * @return {boolean}
 */
conversationSchema.methods.isSupportTopic = function () {
  return this.topic === config.topics.support;
};

module.exports = mongoose.model('Conversation', conversationSchema);
