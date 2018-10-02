'use strict';

const underscore = require('underscore');

const activeStatusText = 'Hi I\'m Freddie from DoSomething.org! Welcome to my weekly updates (up to 8msg/month). Things to know: Msg&DataRatesApply. Text HELP for help, text STOP to stop.';
const helpCenterUrl = 'http://doso.me/1jf4/291kep';
// Note: This url may also appear in hardcoded askSubscriptionStatus topic.
// @see brain/topics/askSubscriptionStatus.rive
const newsUrl = 'https://www.dosomething.org/us/spot-the-signs-guide?source=sms&utm_source=dosomething&utm_medium=sms&utm_campaign=permissioning_weekly&user_id={{user.id}}';
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
  // TODO: Rename as topicTemplates.
  gambitCampaignsTemplates: {
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
    webAskText: 'webAskText',
    webStartExternalPost: 'webStartExternalPost',
    webStartPhotoPost: 'webStartPhotoPost',
  },
  // TODO: Rename as macroTemplates.
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
  gambitCampaignsTemplates: underscore.values(templatesMap.gambitCampaignsTemplates),
  gambitConversationsTemplates: underscore.pluck(underscore.values(templatesMap.gambitConversationsTemplates), 'name'),
};
