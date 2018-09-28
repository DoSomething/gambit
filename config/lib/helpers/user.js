'use strict';

module.exports = {
  createOptions: {
    passwordAlgorithm: 'sha1',
    passwordKey: process.env.DS_GAMBIT_CREATE_USER_PASSWORD_KEY || 'puppetSlothForever',
    passwordLength: 6,
  },
  updatesByMacro: {
    // TODO: DRY subscription helper config, hardcoding these values for now.
    subscriptionStatusActive: { sms_status: 'active' },
    subscriptionStatusLess: { sms_status: 'less' },
    subscriptionStatusResubscribed: { sms_status: 'active' },
    subscriptionStatusStop: { sms_status: 'stop' },
  },
};
