'use strict';

module.exports = {
  cacheTtl: process.env.DS_GAMBIT_CONVERSATIONS_CAMPAIGNS_CACHE_TTL || 300,
  clientOptions: {
    baseUri: process.env.DS_GAMBIT_CAMPAIGNS_API_BASEURI,
    apiKey: process.env.DS_GAMBIT_CAMPAIGNS_API_KEY,
  },
};
