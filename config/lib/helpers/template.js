'use strict';

const underscore = require('underscore');

const supportCommand = 'Q';

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
    askCaption: 'askCaption',
    askPhoto: 'askPhoto',
    askQuantity: 'askQuantity',
    askText: 'askText',
    askWhyParticipated: 'askWhyParticipated',
    askYesNo: 'askYesNo',
    autoReply: 'autoReply',
    completedPhotoPost: 'completedPhotoPost',
    completedPhotoPostAutoReply: 'completedPhotoPostAutoReply',
    completedTextPost: 'completedTextPost',
    invalidAskYesNoResponse: 'invalidAskYesNoResponse',
    invalidCaption: 'invalidCaption',
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
  // TODO: Move these into the replies helper config, or set on config via middleware that checks
  // for each condition.
  gambitConversationsTemplates: {
    badWords: {
      name: 'badWords',
      text: 'Not cool. I\'m a real person & that offends me. I send out these texts to help young ppl take action. If you don\'t want my texts, text STOP or LESS to get less.',
    },
    noCampaign: {
      name: 'noCampaign',
      text: `Sorry, I'm not sure how to respond to that.\n\nText ${supportCommand} if you have a question.`,
    },
  },
};

module.exports = {
  templatesMap,

  /**
   * Example structure of this property
   * { badWords: 'Not cool... text STOP or LESS to get less.', }
   */
  conversationsTemplatesText: underscore.mapObject(
    templatesMap.gambitConversationsTemplates, val => val.text),
  askContinueTemplates: underscore.values(templatesMap.askContinueTemplates),
  askSignupTemplates: underscore.values(templatesMap.askSignupTemplates),
  gambitConversationsTemplates: underscore.pluck(underscore.values(templatesMap.gambitConversationsTemplates), 'name'),
  topicTemplates: underscore.values(templatesMap.topicTemplates),
};
