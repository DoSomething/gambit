'use strict';

const mongoose = require('mongoose');
const logger = require('heroku-logger');
const gambitCampaigns = require('../../lib/gambit-campaigns');

const activeStatus = 'active';

/**
 * Schema.
 */
const templateObject = {
  raw: String,
  rendered: String,
  override: Boolean,
};
const campaignSchema = new mongoose.Schema({
  _id: Number,
  // To be deprecated once this Model is deprecated.
  id: Number,
  title: String,
  status: String,
  keywords: [String],
  topic: String,
  templates: {
    askCaption: templateObject,
    askContinue: templateObject,
    askPhoto: templateObject,
    askSignup: templateObject,
    askQuantity: templateObject,
    askWhyParticipated: templateObject,
    campaignClosed: templateObject,
    completedMenu: templateObject,
    declinedContinue: templateObject,
    declinedSignup: templateObject,
    externalSignupMenu: templateObject,
    gambitSignupMenu: templateObject,
    invalidAskContinueResponse: templateObject,
    invalidAskSignupResponse: templateObject,
    invalidCaption: templateObject,
    invalidCompletedMenuCommand: templateObject,
    invalidPhoto: templateObject,
    invalidQuantity: templateObject,
    invalidSignupMenuCommand: templateObject,
    invalidWhyParticipated: templateObject,
  },
}, { timestamps: true });

/**
 * Parses Gambit API response for a Campaign model.
 * @param {Object} campaign
 * @return {Object}
 */
function parseGambitCampaign(gambitCampaign) {
  const result = {
    id: gambitCampaign.id,
    title: gambitCampaign.title,
    status: gambitCampaign.status,
    templates: gambitCampaign.templates,
    topic: 'campaign',
  };
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

      return this.findOneAndUpdate({ _id: campaignId }, campaign, { upsert: true })
        .then(() => logger.trace('campaign updated', { campaignId }));
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
  return this.findOne({ keywords: keyword.toUpperCase() });
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
 */

/* eslint-disable prefer-arrow-callback */
// Disabling for these virtual properties because arrow functions are not a shortcut for function().
// @see https://github.com/Automattic/mongoose/issues/4143

campaignSchema.virtual('isClosed').get(function () {
  const result = this.status === 'closed';

  return result;
});

/* eslint-enable prefer-arrow-callback */

module.exports = mongoose.model('Campaign', campaignSchema);
