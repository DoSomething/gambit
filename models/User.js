'use strict';

const mongoose = require('mongoose');

/**
 * Schema.
 */
const userSchema = new mongoose.Schema({
  _id: String,
  topic: String,
});

/**
 * Returns reply message to this User for their given incoming message.
 */
userSchema.methods.getGambitReplyToIncomingMessage = function (message) {
  const campaign = {
    id: 2070,
    title: 'Bumble Bands',
  };

  if (this.topic.indexOf('campaign') < 0) {
    this.topic = 'campaign_select';
    this.save();
    return `Want to signup for ${campaign.title}?`;
  }

  if (this.topic === 'campaign_select') {
    if (message === 'yes') {
      this.topic = `campaign_${campaign.id}`;
      this.save();
      return `You're signed up for ${campaign.title}!`;
    }
  }

  if (this.topic === `campaign_${campaign.id}`) {
    return `Thanks for signing up for ${campaign.title}. #blessed`;
  }

  this.topic = 'random';
  this.save();

  return 'Ok, hit me up if you change your mind.';
};

module.exports = mongoose.model('users', userSchema);
