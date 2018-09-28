'use strict';

const fieldValues = {
  sms_status: {
    active: 'active',
    less: 'less',
    pending: 'pending',
    stop: 'stop',
    undeliverable: 'undeliverable',
  },
};

module.exports = {
  createOptions: {
    passwordAlgorithm: 'sha1',
    passwordKey: process.env.DS_GAMBIT_CREATE_USER_PASSWORD_KEY || 'puppetSlothForever',
    passwordLength: 6,
  },
  updatesByMacro: {
    subscriptionStatusActive: { sms_status: fieldValues.sms_status.active },
    subscriptionStatusLess: { sms_status: fieldValues.sms_status.less },
    subscriptionStatusResubscribed: { sms_status: fieldValues.sms_status.active },
  },
};
