'use strict';

const mongoose = require('mongoose');
const Gambit = require('../lib/gambit');

const gambit = new Gambit();


/**
 * Schema.
 */
const campaignSchema = new mongoose.Schema({
  _id: Number,
  title: String,
  gambitSignupMenuMessage: String,
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
 * Parses Gambit API response for a Campaign model.
 */
function parseGambitCampaign(campaign) {
  const result = {
    title: campaign.title,
  };
  const messageTypes = Object.keys(campaign.messages);
  messageTypes.map(messageType => result[messageType] = campaign.messages[messageType].rendered);

  return result;
}

/**
 * Get array of current Gambit campaigns from API and upsert models.
 */
campaignSchema.statics.getIndex = function () {
  console.log('Campaign.getIndex');

  return gambit.get('campaigns')
    .then(campaigns => campaigns.map(campaign => this.getCampaign(campaign.id)))
    .catch(err => console.log(err));
};

/**
 * Get campaign from Gambit API and upsert models.
 */
campaignSchema.statics.getCampaign = function (campaignId) {
  console.log('Campaign.getCampaign');

  return gambit.get(`campaigns/${campaignId}`)
    .then((response) => {
      const campaign = parseGambitCampaign(response);

      return this.findOneAndUpdate({ _id: campaignId }, campaign, { upsert: true })
        .then(() => console.log(`Updated Campaign ${campaignId}: ${campaign.title}`));
    })
    .catch(err => console.log(err));
};

module.exports = mongoose.model('campaigns', campaignSchema);
