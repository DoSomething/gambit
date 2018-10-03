'use strict';

module.exports = {
  types: {
    askYesNo: 'askYesNo',
    autoReply: 'autoReply',
    photoPostConfig: 'photoPostConfig',
    textPostConfig: 'textPostConfig',
    // To be deprecated by autoReply:
    externalPostConfig: 'externalPostConfig',
  },
  rivescriptTopics: {
    askSubscriptionStatus: {
      id: 'ask_subscription_status',
    },
    askVotingPlanAttendingWith: {
      id: 'ask_voting_plan_attending_with',
    },
    askVotingPlanMethodOfTransport: {
      id: 'ask_voting_plan_method_of_transport',
    },
    askVotingPlanStatus: {
      id: 'ask_voting_plan_status',
    },
    askVotingPlanTimeOfDay: {
      id: 'ask_voting_plan_time_of_day',
    },
    default: {
      id: 'random',
    },
    support: {
      id: 'support',
    },
    unsubscribed: {
      id: 'unsubscribed',
    },
  },
};
