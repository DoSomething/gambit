'use strict';

const pollingLocatorQuery = {
  source: 'sms',
  utm_campaign: 'sms_gotv',
  utm_medium: 'sms',
  utm_source: 'dosomething',
};

module.exports = {
  // Tags used in message templates.
  tags: {
    links: 'links',
    user: 'user',
  },
  links: {
    pollingLocator: {
      find: {
        url: process.env.DS_GAMBIT_CONVERSATIONS_POLLING_LOCATOR_FIND_URL || 'https://www.dosomething.org/us/polling-locator-2018',
        query: pollingLocatorQuery,
      },
      share: {
        url: process.env.DS_GAMBIT_CONVERSATIONS_POLLING_LOCATOR_SHARE_URL || 'https://www.dosomething.org/us/campaigns/find-your-v-spot/blocks/5WuCqMMGre02mq8MqK4co6',
        query: pollingLocatorQuery,
      },
    },
  },
};
