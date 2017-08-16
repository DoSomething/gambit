'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const logger = require('heroku-logger');
const gambitCampaigns = require('../../lib/gambit-campaigns');

/**
 * Schema.
 */
const campaignSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  status: String,
  keywords: [String],
  topic: String,
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
  };

  result.keywords = gambitCampaign.keywords.map(keywordObject => keywordObject.keyword);

  return result;
}

/**
 * Get array of current Gambit campaigns from API and upsert models.
 * @return {Promise}
 */
campaignSchema.statics.fetchIndex = function () {
  logger.info('Campaign.fetchIndex');

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
campaignSchema.statics.findByKeyword = function (keyword = '') {
  logger.debug(`Campaign.findByKeyword:${keyword}`);
  const match = keyword.toUpperCase();

  return this.findOne({ keywords: match });
};

/**
 * Virtual properties.
 * @TODO: Define these as fields on Gambit Campaigns upon signoff.
 */

/* eslint-disable prefer-arrow-callback */
// Disabling for these virtual properties because arrow functions are not a shortcut for function().
// @see https://github.com/Automattic/mongoose/issues/4143

// Even though this field exists on a Gambit Campaign, we're overriding it here because the copy
// should prompt the User to text MENU back to find a new Campaign to do (doesn't exist on prod)
campaignSchema.virtual('declinedSignupMessage').get(function () {
  return 'OK. Text MENU if you\'d like to find a different Campaign to join.';
});

campaignSchema.virtual('askSignupMessage').get(function () {
  const strings = ['Wanna', 'Down to', 'Want to'];
  const randomPrompt = strings[Math.floor(Math.random() * strings.length)];

  return `${randomPrompt} sign up for ${this.title}?`;
});

campaignSchema.virtual('declinedContinueMessage').get(function () {
  return `Ok, we'll check in with you about ${this.title} later.`;
});

campaignSchema.virtual('askContinueMessage').get(function () {
  return `Ready to get back to ${this.title}?`;
});

campaignSchema.virtual('invalidSignupResponseMessage').get(function () {
  let text = `Sorry, I didn't get that. Did you want to join ${this.title}?\n\nYes or No`;
  text = `${text}\n\nIf you have a question, text Q.`;

  return text;
});

campaignSchema.virtual('invalidContinueResponseMessage').get(function () {
  let text = `Sorry, I didn't get that. Continue with ${this.title}?\n\nYes or No`;
  text = `${text}\n\nIf you have a question, text Q.`;

  return text;
});
/* eslint-enable prefer-arrow-callback */

module.exports = mongoose.model('campaigns', campaignSchema);
