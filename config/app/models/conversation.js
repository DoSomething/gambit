'use strict';

const topicHelperConfig = require('../../lib/helpers/topic');

module.exports = {
  topics: {
    askSubscriptionStatus: 'ask_subscription_status',
    default: topicHelperConfig.defaultTopicId,
    campaign: 'campaign',
    support: 'support',
  },
};
