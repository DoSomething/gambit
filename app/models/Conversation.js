'use strict';

const mongoose = require('mongoose');
const Promise = require('bluebird');

const DraftSubmission = require('./DraftSubmission');
const Message = require('./Message');

const bertly = require('../../lib/bertly');
const front = require('../../lib/front');
const helpers = require('../../lib/helpers');
const logger = require('../../lib/logger');
const NotFoundError = require('../exceptions/NotFoundError');
const twilio = require('../../lib/twilio');


/**
 * Schema.
 */
const conversationSchema = new mongoose.Schema({
  // Populated when a member has been anonymized
  deletedAt: Date,
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
  // Used to determine how to reply to an inbound messages for the conversation.
  lastOutboundMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
  },
  // Used to support rendering a {{broadcast}} tag in outbound messages for the conversation.
  lastReceivedBroadcastId: String,
}, { timestamps: true });

conversationSchema.index({ createdAt: 1 });
conversationSchema.index({ updatedAt: 1 });
conversationSchema.index({ userId: 1, platform: 1 });

/**
 * Sets `platformUserId` to null in the member's conversation
 * Sets `text` to null in member's inbound messages
 * Deletes Draft submissions belonging to the member's conversation
 * @param {String} userId
 */
conversationSchema.statics.anonymizePIIByUserId = async function (userId) {
  if (!userId) {
    throw new Error('anonymizePIIByUserId: userId can\'t be undefined');
  }
  // Find the member's SMS conversation
  const anonymizeConversationQuery = { userId, platform: 'sms' };
  // Set the conversation's platformUserId to null and populate deletedAt
  const conversationUpdate = {
    $set: {
      platformUserId: null,
      deletedAt: new Date(),
    },
  };
  logger.info('Anonymizing member\'s conversation', anonymizeConversationQuery);
  const conversation = await this
    .findOneAndUpdate(anonymizeConversationQuery, conversationUpdate, { new: true }).exec();

  if (!conversation) {
    throw new NotFoundError(`Conversation for user: ${userId} was not found`);
  }

  // Find all draft submissions belonging to the user's conversation
  const deleteDraftSubmissionsQuery = { conversationId: conversation._id };
  // Find all inbound messages belonging to the user's conversation
  const anonymizeMessagesQuery = { conversationId: conversation._id, direction: 'inbound' };
  // Set the inbound messages text to null and populate deletedAt
  const messageUpdate = {
    $set: {
      text: null,
      deletedAt: new Date(),
    },
  };
  logger.info('Deleting member\'s draft submissions', deleteDraftSubmissionsQuery);
  logger.info('Anonymizing member\'s inbound messages', anonymizeMessagesQuery);
  return Promise.all([
    DraftSubmission.remove(deleteDraftSubmissionsQuery).exec(),
    Message.updateMany(anonymizeMessagesQuery, messageUpdate).exec()]);
};

/**
 * @param {Object} req - Express request
 * @return {Promise}
 */
conversationSchema.statics.createFromReq = function (req) {
  const data = {
    userId: req.userId,
    platform: req.platform,
    platformUserId: req.platformUserId,
    topic: helpers.topic.getDefaultTopicId(),
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

  return this.findOne(query).populate('lastOutboundMessage')
    .then((conversation) => {
      if (!conversation) {
        return Promise.resolve(conversation);
      }
      // Our first release of Conversations did not save userId, and we haven't yet run a bulk
      // backfill query. If req.userId exist but conversation.userId doesn't, backfill it.
      // TODO: Remove this logic if/when a bulk backfill is run:
      // @see https://github.com/DoSomething/gambit-conversations/issues/342#issuecomment-398834646
      const needsUserIdBackfill = req.userId && !conversation.userId;
      if (!needsUserIdBackfill) {
        return Promise.resolve(conversation);
      }

      conversation.userId = req.userId; // eslint-disable-line no-param-reassign
      logger.debug('Backfilling Conversation.userId', {
        userId: req.userId,
        conversationId: conversation.id,
      }, req);

      return conversation.save().then(updatedDoc => updatedDoc.populate('lastOutboundMessage'));
    });
};

/**
 * Saves topicId as topic property.
 *
 * @param {Object} topic
 * @return {Promise}
 */
conversationSchema.methods.setTopic = function (topic) {
  const topicId = topic.id;
  this.topic = topicId;
  logger.debug('updating conversation.topic', { topicId });
  return this.save();
};

/**
 * @return {Promise}
 */
conversationSchema.methods.setDefaultTopic = function () {
  return this.setTopic(helpers.topic.getDefaultTopic());
};

/**
 * @return {Promise}
 */
conversationSchema.methods.setSupportTopic = function () {
  return this.setTopic(helpers.topic.getSupportTopic());
};

/**
 * Returns a DraftSubmission document for given topicId if exists.
 *
 * @param {String} topicId
 * @param {Object} values
 * @return {DraftSubmission}
 */
conversationSchema.methods.createDraftSubmission = function (topicId, values = {}) {
  const conversationId = this._id;
  return DraftSubmission.create({ conversationId, topicId, values });
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
 * Returns a DraftSubmission document for given topicId if exists.
 *
 * @param {String} topicId
 * @return {DraftSubmission}
 */
conversationSchema.methods.getDraftSubmission = function (topicId) {
  const conversationId = this._id;
  return DraftSubmission.findOne({ conversationId, topicId });
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
conversationSchema.methods.createMessage = async function (direction, text, template, req) {
  logger.debug('createMessage', { direction }, req);

  let messageText;

  if (direction !== 'inbound') {
    messageText = await helpers.tags.render(text, req);

    if (bertly.isEnabled() && bertly.textHasLinks(messageText)) {
      messageText = await bertly.parseLinksIntoRedirects(messageText);
    }
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
      return this.setLastOutboundMessage(message);
    });
};

/**
 * Posts the Last Outbound Message to Twilio for SMS conversations.
 */
conversationSchema.methods.postLastOutboundMessageToPlatform = async function (req) {
  const messageText = this.lastOutboundMessage.text;
  /**
  * Don't send if text is empty or is not an SMS message.
  * For "noReply" template replies (members in support or unsubscribed topics).
  * The text is empty in order to leverage this check and stop Gambit
  * from posting the reply to Twilio.
  */
  if (!messageText || !this.isSms()) {
    return null;
  }

  const mediaUrls = this.lastOutboundMessage.attachments
    .map(attachment => attachment.url);

  // Try sending SMS and store success or failure metadata
  try {
    const twilioRes = await twilio.postMessage(req.platformUserId, messageText, mediaUrls);
    // this.lastOutboundMessage is mutated by this function call
    return helpers.twilio.handleMessageCreationSuccess(twilioRes, this.lastOutboundMessage);
  } catch (twilioError) {
    // If there was an error saving the failure metadata, that error would "throw" first instead
    // of the twilioError and the message would be retried.
    // this.lastOutboundMessage is mutated by this function call
    await helpers.twilio.handleMessageCreationFailure(twilioError, this.lastOutboundMessage);
    // If saving the failure metadata is successful.
    // We re-throw the twilio Error so that it's caught on a higher catch block
    // and be suppressed if needed.
    throw twilioError;
  }
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
  return this.topic === helpers.topic.getSupportTopic().id;
};

module.exports = mongoose.model('Conversation', conversationSchema);
