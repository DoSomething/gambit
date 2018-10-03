'use strict';

module.exports = {
  types: {
    askYesNo: 'askYesNo',
    autoReply: 'autoReply',
    photoPostConfig: 'photoPostConfig',
    textPostConfig: 'textPostConfig',
    // To be deprecated by autoReply:
    externalPostConfig: 'externalPostConfig',
  },
  rivescriptTopics: {
    askSubscriptionStatus: {
      id: 'ask_subscription_status',
    },
    default: {
      id: 'random',
    },
    support: {
      id: 'support',
    },
  },
};
