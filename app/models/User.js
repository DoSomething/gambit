'use strict';

const mongoose = require('mongoose');
const Events = require('./Event');

/**
 * Schema.
 */
const userSchema = new mongoose.Schema({
  _id: String,
  platform: String,
  paused: Boolean,
  topic: String,
  campaignId: Number,
  signupStatus: String,
});

/**
 * @param {Object} req - Express request
 * @return {Promise}
 */
userSchema.statics.createFromReq = function (req) {
  const data = {
    _id: req.userId,
    platform: req.body.platform,
    paused: false,
    // TODO: Move value to config.
    topic: 'random',
  };

  return this.create(data);
};

/**
 * Update User topic and check whether to toggle paused.
 * @return {boolean}
 */
userSchema.methods.updateUserTopic = function (newTopic) {
  if (this.topic === newTopic) {
    return this.save();
  }

  let updatePaused = false;

  if (this.topic.includes('support') && ! newTopic.includes('support')) {
    updatePaused = true;
    this.paused = false;
  }

  if (! this.topic.includes('support') && newTopic.includes('support')) {
    updatePaused = true;
    this.paused = true;
  }

  this.topic = newTopic;

  if (updatePaused) {
    this.createEvent('updatePaused', { user: this });
  }

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

module.exports = mongoose.model('users', userSchema);
