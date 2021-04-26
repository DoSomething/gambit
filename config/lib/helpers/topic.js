'use strict';

// TODO: Merge template config here to DRY.
const templateConfig = require('./template');

const topicTemplates = templateConfig.templatesMap.topicTemplates;

module.exports = {
  types: {
    askMultipleChoice: {
      type: 'askMultipleChoice',
    },
    askSubscriptionStatus: {
      type: 'askSubscriptionStatus',
    },
    askVotingPlanStatus: {
      type: 'askVotingPlanStatus',
    },
    askYesNo: {
      type: 'askYesNo',
    },
    autoReply: {
      type: 'autoReply',
      transitionTemplate: topicTemplates.autoReplyTransition,
    },
    photoPostConfig: {
      type: 'photoPostConfig',
      transitionTemplate: topicTemplates.startPhotoPost,
      draftSubmissionValuesMap: {
        hoursSpent: 'hoursSpent',
        quantity: 'quantity',
        url: 'url',
        whyParticipated: 'whyParticipated',
      },
    },
    textPostConfig: {
      type: 'textPostConfig',
      transitionTemplate: topicTemplates.askText,
    },
    // To be deprecated by autoReply:
    externalPostConfig: {
      type: 'externalPostConfig',
      transitionTemplate: topicTemplates.startExternalPost,
    },
  },
  /**
   * TODO: Instead of defining these here, the topic helpers that reference these should inspect the
   * loaded Rivescript topics.
   */
  rivescriptTopics: {
    askVotingMethod: {
      id: 'ask_voting_method',
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
