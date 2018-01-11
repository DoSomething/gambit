'use strict';

module.exports = {
  clientOptions: {
    apiKey: process.env.DS_NORTHSTAR_API_KEY,
    baseURI: process.env.DS_NORTHSTAR_API_BASEURI,
  },
  getUserFields: {
    id: 'id',
    email: 'email',
    mobile: 'mobile',
  },
};
