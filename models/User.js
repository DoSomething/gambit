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
 * Prompt User to signup for given Campaign model.
 * @param {Campaign} campaign
 * @return {Promise}
 */
userSchema.methods.promptSignupForCampaign = function (campaign) {
  console.log(`user.promptSignupForCampaign campaignId=${campaign._id}`);

  this.topic = campaign.topic;
  this.campaignId = campaign._id;
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
