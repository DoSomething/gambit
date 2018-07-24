'use strict';

module.exports = {
  clientOptions: {
    baseUri: process.env.DS_GAMBIT_CAMPAIGNS_API_BASEURI,
    apiKey: process.env.DS_GAMBIT_CAMPAIGNS_API_KEY,
  },
  authHeader: 'x-gambit-api-key',
  closedStatusValue: 'closed',
  endpoints: {
    broadcasts: 'broadcasts',
    campaigns: 'campaigns',
    defaultTopicTriggers: 'defaultTopicTriggers',
    topics: 'topics',
  },
};
