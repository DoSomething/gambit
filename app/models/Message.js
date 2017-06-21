'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const messageSchema = new mongoose.Schema({
  userId: String,
  direction: String,
  type: String,
  body: String,
  topic: String,
  campaignId: Number,
  signupStatus: String,
});

module.exports = mongoose.model('messages', messageSchema);
