'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const messageSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true,
  },
  date: { type: Date, default: Date.now },
  direction: {
    type: String,
    enum: ['inbound', 'outbound-reply', 'outbound-api-send', 'outbound-api-cc'],
  },
  campaignId: Number,
  template: String,
  text: String,
  topic: String,
});

module.exports = mongoose.model('messages', messageSchema);
