'use strict';

// TODO: Move subscription config into this file to deprecate.
const subscriptionStatusValues = require('./subscription').subscriptionStatuses;

const userFields = {
  // Note: All conversations save subscription status as user sms_status for now: sms is the only
  // supported platform where users message us (Slack is internal to staff via gambit-slack app)
  subscriptionStatus: {
    name: 'sms_status',
    values: subscriptionStatusValues,
  },
  votingPlanAttendingWith: {
    name: 'voting_plan_attending_with',
    values: {
      alone: 'alone',
      coWorkers: 'co_workers',
      family: 'family',
      friends: 'friends',
    },
  },
  votingPlanMethodOfTransport: {
    name: 'voting_plan_method_of_transport',
    values: {
      bike: 'bike',
      drive: 'drive',
      publicTransport: 'public_transport',
      walk: 'walk',
    },
  },
  votingPlanStatus: {
    name: 'voting_plan_status',
    values: {
      cantVote: 'cant_vote',
      notVoting: 'not_voting',
      voted: 'voted',
      voting: 'voting',
    },
  },
};

module.exports = {
  createOptions: {
    passwordAlgorithm: 'sha1',
    passwordKey: process.env.DS_GAMBIT_CREATE_USER_PASSWORD_KEY || 'puppetSlothForever',
    passwordLength: 6,
  },
  fields: userFields,
};
