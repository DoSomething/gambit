'use strict';

// TODO: Merge template config here to DRY.
const templateConfig = require('./template');

const topicTemplates = templateConfig.templatesMap.topicTemplates;

module.exports = {
  types: {
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
        caption: 'caption',
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
    /**
     * Deprecated topics.
     *
     * The campaign topic was used before we began supporting multiple types of conversations for a
     * a campaign. This topic no longer gets saved, and has been deprecated by saving Contentful IDs
     * as the conversation topic.
     */
    campaign: {
      id: 'campaign',
      deprecated: true,
    },
    /**
     * The survey_response topic has been deprecated by the autoReply and autoReplyBroadcast content
     * types.
     */
    surveyResponse: {
      id: 'survey_response',
      deprecated: true,
    },
  },
};
