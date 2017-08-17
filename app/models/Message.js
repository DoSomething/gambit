'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const messageSchema = new mongoose.Schema({
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
  },
  userId: String,
  direction: {
    type: String,
    enum: ['inbound', 'outbound-reply', 'outbound-api-send', 'outbound-api-import'],
  },
  campaignId: Number,
  template: String,
  text: String,
  topic: String,
  attachments: Array,
}, { timestamps: true });

module.exports = mongoose.model('messages', messageSchema);
