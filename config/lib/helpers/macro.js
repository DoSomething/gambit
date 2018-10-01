'use strict';

module.exports = {
  macros: {
    catchAll: 'catchAll',
    changeTopic: 'changeTopic',
    noReply: 'noReply',
    saidNo: 'saidNo',
    saidYes: 'saidYes',
    sendCrisisMessage: 'sendCrisisMessage',
    sendInfoMessage: 'sendInfoMessage',
    subscriptionStatusActive: 'subscriptionStatusActive',
    subscriptionStatusLess: 'subscriptionStatusLess',
    subscriptionStatusResubscribed: 'subscriptionStatusResubscribed',
    subscriptionStatusStop: 'subscriptionStatusStop',
    supportRequested: 'supportRequested',
    votingPlanStatusCantVote: {
      name: 'votingPlanStatusCantVote',
      text: 'Ok.',
    },
    votingPlanStatusVoted: {
      name: 'votingPlanStatusVoted',
      text: 'Awesome! Thank you for voting.',
    },
    votingPlanStatusVoting: {
      name: 'votingPlanStatusVoting',
      text: 'How are you getting to the polls? A) Drive B) Walk C) Bike D) Public transportation',
    },
    votingPlanStatusNotVoting: {
      name: 'votingPlanStatusNotVoting',
      text: 'Mind sharing why you aren\t not voting?',
    },
  },
  replies: {
    noReply: 'noReply',
    sendCrisisMessage: 'crisisMessage',
    sendInfoMessage: 'infoMessage',
    subscriptionStatusActive: 'subscriptionStatusActive',
    subscriptionStatusLess: 'subscriptionStatusLess',
    subscriptionStatusResubscribed: 'subscriptionStatusResubscribed',
    subscriptionStatusStop: 'subscriptionStatusStop',
  },
};
