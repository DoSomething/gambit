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
        url: 'https://www.dosomething.org/us/polling-locator-2018',
        query: pollingLocatorQuery,
      },
      share: {
        url: 'https://www.dosomething.org/us/campaigns/find-your-v-spot/blocks/5WuCqMMGre02mq8MqK4co6',
        query: pollingLocatorQuery,
      },
    },
  },
};
