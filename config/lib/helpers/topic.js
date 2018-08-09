'use strict';

module.exports = {
  // These should correspond to topics defined in brain/topics.rive
  // TODO: Move this into the rivescriptTopics defined property below.
  hardcodedTopicIds: [
    'ask_subscription_status',
    // The campaign topic may exist for users who haven't messaged since querying topics endpoint.
    'campaign',
    'flsa',
    'random',
    'support',
    'survey_response',
    'tmi_level1',
    'tmi_completed',
    'unsubscribed',
  ],
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
