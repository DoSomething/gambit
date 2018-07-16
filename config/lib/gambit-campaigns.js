'use strict';

module.exports = {
  clientOptions: {
    baseUri: process.env.DS_GAMBIT_CAMPAIGNS_API_BASEURI,
    apiKey: process.env.DS_GAMBIT_CAMPAIGNS_API_KEY,
  },
  closedStatusValue: 'closed',
  endpoints: {
    broadcasts: 'broadcasts',
  },
};
