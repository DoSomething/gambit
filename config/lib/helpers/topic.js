'use strict';

module.exports = {
  // These should correspond to topics defined in brain/topics.rive
  hardcodedTopicIds: [
    'askSubscriptionStatus',
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
  randomTopicId: 'random',
};
