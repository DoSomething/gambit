'use strict';

module.exports = {
  clientOptions: {
    apiKey: process.env.DS_NORTHSTAR_API_KEY,
    baseUri: process.env.DS_NORTHSTAR_API_BASEURI,
  },
  createUserOptions: {
    smsStatus: 'active',
    passwordAlgorithm: 'sha1',
    passwordKey: process.env.DS_GAMBIT_CREATE_USER_PASSWORD_KEY || 'puppetSlothForever',
    source: process.env.DS_GAMBIT_CREATE_USER_SOURCE || 'sms',
  },
};
