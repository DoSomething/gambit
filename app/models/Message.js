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

module.exports = mongoose.model('Message', messageSchema);
