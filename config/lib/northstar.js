'use strict';

module.exports = {
  clientOptions: {
    apiKey: process.env.DS_NORTHSTAR_API_KEY,
    baseURI: process.env.DS_NORTHSTAR_API_BASEURI,
    // TODO: Use this in the routes integration test helper to intercept calls to get credentials
    oauth: {
      host: process.env.DS_NORTHSTAR_API_OAUTH_TOKEN_HOST,
      path: process.env.DS_NORTHSTAR_API_OAUTH_TOKEN_PATH,
    },
  },
  getUserFields: {
    id: 'id',
    email: 'email',
    mobile: 'mobile',
  },
};
