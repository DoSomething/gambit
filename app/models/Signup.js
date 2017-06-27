'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const signupSchema = new mongoose.Schema({
  userId: String,
  campaignId: String,
  campaignRunId: Number,
  keyword: String,
  source: String,
});

module.exports = mongoose.model('signups', signupSchema);
