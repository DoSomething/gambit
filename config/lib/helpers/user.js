'use strict';

// TODO: Deprecate subscription config by defining profile field values in this file, as we'll soon
// be adding more profile fields/values to update via new macros.
const subscriptionStatusValues = require('./subscription').subscriptionStatuses;

const userFields = {
  // Note: All conversations save subscription status to sms_status field for now: sms is the only
  // supported platform where users message us (Slack is internal to staff via gambit-slack app)
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
  updatesByMacro: {
    subscriptionStatusActive: getSubscriptionStatusUpdate(subscriptionStatusValues.active),
    subscriptionStatusLess: getSubscriptionStatusUpdate(subscriptionStatusValues.less),
    subscriptionStatusResubscribed: getSubscriptionStatusUpdate(subscriptionStatusValues.active),
    subscriptionStatusStop: getSubscriptionStatusUpdate(subscriptionStatusValues.stop),
    // TODO: Add more macros to save values to voting plan fields
    // e.g. votingPlanStatusVoting, votingPlanAttendingWithFriends
  },
};
