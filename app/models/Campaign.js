'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const logger = require('heroku-logger');
const gambitCampaigns = require('../../lib/gambit');

/**
 * Schema.
 */
const campaignSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  status: String,
  currentCampaignRunId: Number,
  keywords: [String],
  topic: String,
  gambitSignupMenuMessage: String,
  externalSignupMenuMessage: String,
  invalidSignupMenuCommandMessage: String,
  askQuantityMessage: String,
  invalidQuantityMessage: String,
  askPhotoMessage: String,
  invalidPhotoMessage: String,
  askCaptionMessage: String,
  askWhyParticipatedMessage: String,
  completedMenuMessage: String,
  invalidCompletedMenuCommandMessage: String,
  scheduledRelativeToSignupDateMessage: String,
  scheduledRelativeToReportbackDateMessage: String,
  memberSupportMessage: String,
  campaignClosedMessage: String,
  errorOccurredMessage: String,
});

/**
 * @param {Number} campaignId
 * @return {String}
 */
function getTopicForCampaignId(campaignId) {
  // Check for triggers specific to this Campaign.
  if (fs.existsSync(`brain/campaigns/${campaignId}.rive`)) {
    return `campaign_${campaignId}`;
  }

  return 'campaign';
}

/**
 * Parses Gambit API response for a Campaign model.
 * @param {Object} campaign
 * @return {Object}
 */
function parseGambitCampaign(gambitCampaign) {
  const result = {
    title: gambitCampaign.title,
    status: gambitCampaign.status,
    currentCampaignRunId: gambitCampaign.current_run,
  };

  const messageTypes = Object.keys(gambitCampaign.messages);
  messageTypes.map(type => result[type] = gambitCampaign.messages[type].rendered);
  result.keywords = gambitCampaign.keywords.map(keywordObject => keywordObject.keyword);

  return result;
}

/**
 * Get array of current Gambit campaigns from API and upsert models.
 * @return {Promise}
 */
campaignSchema.statics.fetchIndex = function () {
  return gambitCampaigns.get('campaigns')
    .then(campaigns => campaigns.map(campaign => this.fetchCampaign(campaign.id)))
    .catch(err => logger.error('Campaign.fetchIndex', err));
};

/**
 * Get campaign from Gambit API and upsert models.
 * @return {Promise}
 */
campaignSchema.statics.fetchCampaign = function (campaignId) {
  return gambitCampaigns.get(`campaigns/${campaignId}`)
    .then((response) => {
      const campaign = parseGambitCampaign(response);
      campaign.topic = getTopicForCampaignId(campaignId);

      return this.findOneAndUpdate({ _id: campaignId }, campaign, { upsert: true })
        .then(() => logger.debug('Campaign.fetchCampaign', campaign));
    })
    .catch(err => logger.error('Campaign.fetchCampaign', err));
};

/**
 * Returns a random Campaign model.
 * @return {Promise}
 */
campaignSchema.statics.getRandomCampaign = function () {
  logger.debug('Campaign.getRandomCampaign');

  return this
    .aggregate([{ $sample: { size: 1 } }])
    .exec()
    .then(campaigns => this.findById(campaigns[0]._id));
};

/**
 * Returns Campaign with given keyword if exists.
 * @return {Promise}
 */
campaignSchema.statics.findByKeyword = function (keyword) {
  logger.debug(`Campaign.findByKeyword:${keyword}`);
  const match = keyword.toUpperCase();

  return this.findOne({ keywords: match });
};

/**
 * Get Gambit messages that don't exist yet.
 */
campaignSchema.methods.getSignupConfirmedMessage = function () {
  return `You're signed up for ${this.title}. #blessed`;
};

campaignSchema.methods.getSignupDeclinedMessage = function () {
  return 'OK. Text MENU if you\'d like to find a different Campaign to join.';
};

campaignSchema.methods.getAskSignupMessage = function () {
  const strings = ['Wanna', 'Down to', 'Want to'];
  const randomPrompt = strings[Math.floor(Math.random() * strings.length)];

  return `${randomPrompt} sign up for ${this.title}?`;
};

campaignSchema.methods.getContinueDeclinedMessage = function () {
  return `Ok, we'll check in with you about ${this.title} later.`;
};

campaignSchema.methods.getContinuePromptMessage = function () {
  return `Ready to get back to ${this.title}?`;
};


/**
 * @param {string} messageType
 * @return {string}
 */
campaignSchema.methods.getMessageForMessageType = function (messageType) {
  logger.debug(`Campaign.getMessageForMessageType:${messageType}`);

  let messageText;
  // TODO: If this.status === 'closed', return closedMessage.
  switch (messageType) {
    case 'continueDeclinedMessage':
      messageText = this.getContinueDeclinedMessage();
      break;
    case 'continuePromptMessage':
      messageText = this.getContinuePromptMessage();
      break;
    case 'signupConfirmedMessage':
      messageText = this.getSignupConfirmedMessage();
      break;
    case 'signupDeclinedMessage':
      messageText = this.getSignupDeclinedMessage();
      break;
    case 'askSignupMessage':
      messageText = this.getAskSignupMessage();
      break;
    default:
      messageText = this[messageType];
  }

  return messageText;
};

module.exports = mongoose.model('campaigns', campaignSchema);
