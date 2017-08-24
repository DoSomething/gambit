'use strict';

const fs = require('fs');
const mongoose = require('mongoose');
const logger = require('heroku-logger');
const gambitCampaigns = require('../../lib/gambit-campaigns');

const activeStatus = 'active';

/**
 * Schema.
 */
const campaignSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  status: String,
  keywords: [String],
  topic: String,
  templates: {
    campaignClosedMessage: String,
    externalSignupMenuMessage: String,
  },
}, { timestamps: true });

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
    templates: {},
  };

  const templates = Object.keys(gambitCampaign.messages);
  templates.forEach((template) => {
    result.templates[template] = gambitCampaign.messages[template].rendered;
  });

  result.keywords = gambitCampaign.keywords.map(keywordObject => keywordObject.keyword);

  return result;
}

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
        .then(() => logger.debug('campaign updated', { campaignId }));
    })
    .catch(err => logger.error('Campaign.fetchCampaign', { err }));
};

/**
 * Returns a random Campaign model.
 * @return {Promise}
 */
campaignSchema.statics.findRandomCampaignNotEqualTo = function (campaignId) {
  logger.debug('Campaign.findRandomCampaignNotEqualTo', { campaignId });

  return this
    .aggregate([
      {
        $match: {
          status: activeStatus,
          _id: { $ne: campaignId },
        },
      },
      {
        $sample: {
          size: 1,
        },
      },
    ])
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
 * Updates active Campaigns by querying Gambit Campaigns API.
 * @return {Promise}
 */
campaignSchema.statics.sync = function () {
  logger.debug('Campaign.sync');
  const updated = {};

  return gambitCampaigns.getActiveCampaigns()
    .then((activeCampaigns) => {
      // Update document for each active Campaign returned.
      activeCampaigns.forEach((campaign) => {
        const campaignId = campaign.id;
        logger.trace('activeCampaign', { campaignId });

        updated[campaignId] = true;
        this.fetchCampaign(campaignId);
      });

      return this.find({ status: activeStatus });
    })
    .then((activeCache) => {
      activeCache.forEach((campaign) => {
        const campaignId = campaign._id;
        logger.trace('activeCache', { campaignId });

        if (!updated[campaignId]) {
          logger.debug('close campaign', { campaignId });
          // TODO: Fetch Campaign to get latest messages, blocked by Gambit Campaigns API bug.
          // @see https://github.com/DoSomething/gambit/issues/951
          campaign.status = 'closed'; // eslint-disable-line no-param-reassign
          campaign.save();
        }
      });
    })
    .catch((err) => {
      logger.error('sync', { err });
    });
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

campaignSchema.virtual('isClosed').get(function () {
  const result = this.status === 'closed';

  return result;
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
