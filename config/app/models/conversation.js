'use strict';

const topicHelperConfig = require('../../lib/helpers/topic');

module.exports = {
  topics: {
    askSubscriptionStatus: 'askSubscriptionStatus',
    default: topicHelperConfig.randomTopicId,
    campaign: 'campaign',
    support: 'support',
  },
};
