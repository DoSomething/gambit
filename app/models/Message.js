'use strict';

const mongoose = require('mongoose');

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
  },
  campaignId: Number,
  template: String,
  text: String,
  topic: String,
  attachments: Array,
  metadata: {
    requestId: String,
    retryCount: Number,
  },
}, { timestamps: true });

/**
 * gets the inbound message that matches this metadata.requestId
 * and updates it with the new properties passed in the update object.
 * @param {string} requestId
 * @param {object} update
 * @return {object}
 */
messageSchema.statics.getAndUpdateInboundMessageByRequestId = function (requestId, update = {}) {
  const query = {
    'metadata.requestId': requestId,
    direction: 'inbound',
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
  return this.getAndUpdateInboundMessageByRequestId(requestId, { metadata });
};


module.exports = mongoose.model('Message', messageSchema);
