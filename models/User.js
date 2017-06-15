'use strict';

const mongoose = require('mongoose');
const helpers = require('../lib/helpers');

/**
 * Schema.
 */
const userSchema = new mongoose.Schema({
  _id: String,
  topic: String,
  campaignId: Number,
  signupStatus: String,
});

/**
 * Prompt user to signup for given campaign ID.
 */
userSchema.methods.promptSignupForCampaignId = function (campaignId) {
  this.topic = `campaign_${this.campaignId}`;
  this.campaignId = campaignId;
  this.signupStatus = 'prompt';

  return this.save();
};

/**
 * Post signup for current campaign and set it as the topic.
 */
userSchema.methods.postSignup = function () {
  // TODO: Post to DS API
  this.signupStatus = 'doing';

  return this.save();
};

/**
 * Unset current campaign and reset topic to random.
 */
userSchema.methods.declineSignup = function () {
  this.campaignId = null;
  this.signupStatus = null;
  this.topic = 'random';

  return this.save();
};

module.exports = mongoose.model('users', userSchema);
