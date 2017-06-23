'use strict';

const mongoose = require('mongoose');
const Events = require('./Event');

/**
 * Schema.
 */
const userSchema = new mongoose.Schema({
  _id: String,
  platform: String,
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
  const nonCampaignTopic = (! topic || topic.indexOf('campaign') < 0);

  return ! nonCampaignTopic;
};

/**
 * Returns whether current user is in a topic for a Campaign.
 * @return {boolean}
 */
userSchema.methods.updateUserTopic = function (topic) {
  const currentTopic = this.topic;
  // TODO: Create event when we're leaving a Support Topic.
  this.topic = topic;

  return this.save();
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
};

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

/**
 * Creates an Event model with given type and data.
 */
userSchema.methods.createEvent = function (type, data) {
  const eventData = {
    userId: this._id,
    type,
    data,
  };

  Events.create(eventData)
    .then(event => console.log(`created eventId=${event._id}`))
    .catch(err => console.log(err.message));
};

/**
 * Pre save hooks.
 */
userSchema.pre('save', function (next) {
  if (this.isModified('topic')) {
    this.createEvent('updateTopic', this.topic);
  }

  next();
});

module.exports = mongoose.model('users', userSchema);
