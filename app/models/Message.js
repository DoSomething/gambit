'use strict';

const mongoose = require('mongoose');
const logger = require('heroku-logger');
const Promise = require('bluebird');

/**
 * Schema.
 */
const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    index: true,
  },
  direction: {
    type: String,
    enum: ['inbound', 'outbound-reply', 'outbound-api-send', 'outbound-api-import'],
    required: true,
  },
  platformMessageId: { type: String, index: true },
  campaignId: Number,
  template: String,
  text: String,
  topic: String,
  attachments: Array,
  broadcastId: String,
  agentId: String,
  match: String,
  macro: String,
  metadata: {
    requestId: { type: String, index: true },
    retryCount: Number,
  },
}, { timestamps: true });

messageSchema.index({ createdAt: 1 });
messageSchema.index({ updatedAt: 1 });

/**
 * Gets the message that matches this metadata.requestId and direction.
 * Updates it with the new properties passed in the update object.
 * @param {string} requestId
 * @param {object} update
 * @return {object}
 */
messageSchema.statics.updateMessageByRequestIdAndDirection = function (requestId,
  update = {}, direction) {
  if (!direction) {
    logger.error('updateMessageByRequestIdAndDirection: direction argument missing.');
    return Promise.resolve(null);
  }
  const query = {
    'metadata.requestId': requestId,
    direction,
  };
  const options = { new: true };

  return this.findOneAndUpdate(query, update, options);
};

/**
 * gets the inbound message that matches this metadata.requestId
 * and updates its metadata with the new one.
 * @param {string} requestId
 * @param {object} metadata
 * @return {object}
 */
messageSchema.statics.updateInboundMessageMetadataByRequestId = function (requestId,
  metadata = {}) {
  return this.updateMessageByRequestIdAndDirection(requestId, { metadata }, 'inbound');
};

messageSchema.index({ broadcastId: -1, direction: 1, macro: 1 });

module.exports = mongoose.model('Message', messageSchema);
