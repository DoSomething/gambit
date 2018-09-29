'use strict';

const userFields = {
  subscriptionStatus: 'sms_status',
};

function getSubscriptionStatusUpdate(value) {
  const payload = {};
  payload[userFields.subscriptionStatus] = value;
  return payload;
}

module.exports = {
  createOptions: {
    passwordAlgorithm: 'sha1',
    passwordKey: process.env.DS_GAMBIT_CREATE_USER_PASSWORD_KEY || 'puppetSlothForever',
    passwordLength: 6,
  },
  fields: {
    // Note: All platforms are storing subscription status on sms_status for now, as sms is the only
    // supported medium our users can message us (Slack is internal to staff via gambit-slack app)
    subscriptionStatus: 'sms_status',
  },
  // TODO: DRY subscription helper config, hardcoding these values for now.
  updatesByMacro: {
    subscriptionStatusActive: getSubscriptionStatusUpdate('active'),
    subscriptionStatusLess: getSubscriptionStatusUpdate('less'),
    subscriptionStatusResubscribed: getSubscriptionStatusUpdate('active'),
    subscriptionStatusStop: getSubscriptionStatusUpdate('stop'),
    // TODO: Add more macros to save values to voting plan fields
    // e.g. votingPlanStatusVoting, votingPlanAttendingWithFriends
  },
};
