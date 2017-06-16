'use strict';

const mongoose = require('mongoose');

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
 * Returns whether current user is in a topic for a Campaign.
 * @return {boolean}
 */
userSchema.methods.hasCampaignTopic = function () {
  const topic = this.topic;
  const nonCampaignTopic = (!topic || topic.indexOf('campaign') < 0);

  return !nonCampaignTopic;
};

/**
 * Returns save of User for updating given Campaign (and its topic) with Signup Status.
 * @param {Campaign} campaign
 * @param {string} signupStatus
 * @return {Promise}
 */
userSchema.methods.setCurrentCampaignWithSignupStatus = function (campaign, signupStatus) {
  console.log(`userId=${this._id} set campaignId=${campaign._id} signupStatus=${signupStatus}`);

  this.topic = campaign.topic;
  this.campaignId = campaign._id;
  this.signupStatus = signupStatus;

  return this.save();
}

/**
 * Prompt User to signup for given Campaign model.
 * @param {Campaign} campaign
 * @return {Promise}
 */
userSchema.methods.promptSignupForCampaign = function (campaign) {
  return this.setCurrentCampaignWithSignupStatus(campaign, 'prompt');
};

/**
 * Post signup for current campaign and set it as the topic.
 */
userSchema.methods.postSignupForCampaign = function (campaign) {
  // TODO: Post Signup to DS API.
  return this.setCurrentCampaignWithSignupStatus(campaign, 'doing');
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
