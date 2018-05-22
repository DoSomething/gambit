'use strict';

const mongoose = require('mongoose');
const logger = require('heroku-logger');
const Promise = require('bluebird');

const utilHelper = require('../../lib/helpers/util');

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
  userId: { type: String, index: true },
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
  // TODO: Add metadata.failureInjectionTestId when we implement that feature.
  metadata: {
    requestId: { type: String, index: true },
    retryCount: Number,
    delivery: {
      queuedAt: Date,
      deliveredAt: Date,
      failedAt: Date,
      failureData: { type: mongoose.Schema.Types.Mixed },
      totalSegments: Number,
    },
  },
}, { timestamps: true });

messageSchema.index({ createdAt: 1 });
messageSchema.index({ updatedAt: 1 });
messageSchema.index({ createdAt: -1, campaignId: 1 });
messageSchema.index({ createdAt: -1, broadcastId: 1, direction: 1, macro: 1 });
messageSchema.index({ broadcastId: -1, direction: 1, macro: 1 });

/**
 * Static Methods
 */

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

  return utilHelper.deepUpdateWithDotNotationParser(update)
    .then(parsedUpdate => this.findOneAndUpdate(query, parsedUpdate, options));
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

module.exports = mongoose.model('Message', messageSchema);
