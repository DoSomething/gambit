'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const Gambit = require('../lib/gambit');

const gambit = new Gambit();

/**
 * Schema.
 */
const campaignSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  status: String,
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
    console.log('override exists');
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
  console.log('Campaign.fetchIndex');

  return gambit.get('campaigns')
    .then(campaigns => campaigns.map(campaign => this.fetchCampaign(campaign.id)))
    .catch(err => console.log(err));
};

/**
 * Get campaign from Gambit API and upsert models.
 * @return {Promise}
 */
campaignSchema.statics.fetchCampaign = function (campaignId) {
  console.log('Campaign.fetchCampaign');

  return gambit.get(`campaigns/${campaignId}`)
    .then((response) => {
      const campaign = parseGambitCampaign(response);
      campaign.topic = getTopicForCampaignId(campaignId);

      return this.findOneAndUpdate({ _id: campaignId }, campaign, { upsert: true })
        .then(() => console.log(`Updated Campaign ${campaignId}: ${campaign.title}`));
    })
    .catch(err => console.log(err));
};

/**
 * Get array of current Gambit campaigns from API and upsert models.
 * @return {Promise}
 */
campaignSchema.statics.getRandomCampaign = function () {
  console.log('Campaign.getRandomCampaign');

  return this
    .aggregate([ { $sample: { size: 1 } } ])
    .exec()
    .then((campaigns) => {
      return this.findById(campaigns[0]._id);
    });
};

/**
 * Get Gambit messages that don't exist yet.
 */
campaignSchema.methods.getSignupConfirmedMessage = function () {
  return `You're signed up for ${this.title}. #blessed`;
}

campaignSchema.methods.getSignupDeclinedMessage = function () {
  return `Got it - we'll hold on ${this.title}. Check back with you later!`;
}

campaignSchema.methods.getSignupPromptMessage = function () {
  return `Want to sign up for ${this.title}? Yes or No`;
}

module.exports = mongoose.model('campaigns', campaignSchema);
