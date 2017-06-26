'use strict';

const mongoose = require('mongoose');
const logger = require('heroku-logger');
const Actions = require('./Action');
const Signups = require('./Signup');

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
    this.createAction('updateUserPaused', { user: this });
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
 * @param {Campaign} campaign
 * @param {string} source
 * @param {string} keyword
 */
userSchema.methods.signupForCampaign = function (campaign, source, keyword) {
  // TODO: Post Signup to DS API.
  this.setCurrentCampaignWithSignupStatus(campaign, 'doing');

  return Signups.create({
    userId: this._id,
    campaignId: campaign._id,
    campaignRunId: campaign.currentCampaignRunId,
    source,
    keyword,
  });
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
 * Creates an Action model with given type and data.
 */
userSchema.methods.createAction = function (type, data) {
  const actionData = {
    userId: this._id,
    type,
    data,
  };

  Actions.create(actionData)
    .then(action => logger.debug(`created actionId:${action._id}`))
    .catch(err => logger.error(err));
};

module.exports = mongoose.model('users', userSchema);
