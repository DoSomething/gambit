'use strict';

module.exports = {
  createOptions: {
    passwordAlgorithm: 'sha1',
    passwordKey: process.env.DS_GAMBIT_CREATE_USER_PASSWORD_KEY || 'puppetSlothForever',
    passwordLength: 6,
  },
  fields: {
    // Note: All conversations save subscription status to sms_status field for now: sms is the only
    // supported platform where users message us (Slack is internal to staff via gambit-slack app)
    subscriptionStatus: {
      name: 'sms_status',
      values: {
        active: 'active',
        less: 'less',
        pending: 'pending',
        stop: 'stop',
        undeliverable: 'undeliverable',
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
  },
};
