'use strict';

// TODO: Move these templates into the replies helper config -- they're only used by its tests.
const underscore = require('underscore');

const templatesMap = {
  campaignClosed: 'campaignClosed',
  declinedSignup: 'declinedSignup',
  declinedContinue: 'declinedContinue',
  rivescriptReply: 'rivescript',
  memberSupport: 'memberSupport',
  askContinueTemplates: {
    askContinue: 'askContinue',
    invalidAskContinueResponse: 'invalidAskContinueResponse',
  },
  askSignupTemplates: {
    askSignup: 'askSignup',
    askYesNo: 'askYesNo',
    invalidAskSignupResponse: 'invalidAskSignupResponse',
  },
  topicTemplates: {
    askPhoto: 'askPhoto',
    askQuantity: 'askQuantity',
    askText: 'askText',
    askWhyParticipated: 'askWhyParticipated',
    askYesNo: 'askYesNo',
    autoReply: 'autoReply',
    autoReplyTransition: 'autoReplyTransition',
    completedPhotoPost: 'completedPhotoPost',
    completedPhotoPostAutoReply: 'completedPhotoPostAutoReply',
    completedTextPost: 'completedTextPost',
    invalidAskYesNoResponse: 'invalidAskYesNoResponse',
    invalidPhoto: 'invalidPhoto',
    invalidQuantity: 'invalidQuantity',
    invalidText: 'invalidText',
    invalidWhyParticipated: 'invalidWhyParticipated',
    photoPostBroadcast: 'photoPostBroadcast',
    saidNo: 'saidNo',
    saidYes: 'saidYes',
    startExternalPost: 'startExternalPost',
    startExternalPostAutoReply: 'startExternalPostAutoReply',
    startPhotoPost: 'startPhotoPost',
    startPhotoPostAutoReply: 'startPhotoPostAutoReply',
    textPostBroadcast: 'textPostBroadcast',
    votingPlanStatusCantVote: 'votingPlanStatusCantVote',
    votingPlanStatusNotVoting: 'votingPlanStatusNotVoting',
    votingPlanStatusVoted: 'votingPlanStatusVoted',
    webSignup: 'webSignup',
  },
};

module.exports = {
  templatesMap,
  askContinueTemplates: underscore.values(templatesMap.askContinueTemplates),
  askSignupTemplates: underscore.values(templatesMap.askSignupTemplates),
  topicTemplates: underscore.values(templatesMap.topicTemplates),
};
