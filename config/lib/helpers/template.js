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
    crisis: {
      name: 'crisis',
      text: 'Thanks for being brave and sharing that. If you want to talk to someone, our friends at CTL are here for you 24/7. Just send a text to 741741. Theyll listen!',
    },
    info: {
      name: 'info',
      text: `These are Do Something Alerts - 4 messages/mo. Info help@dosomething.org or ${helpCenterUrl}. Txt STOP to quit. Msg&Data Rates May Apply.`,
    },
    noCampaign: {
      name: 'noCampaign',
      text: `Sorry, I'm not sure how to respond to that.\n\nText ${supportCommand} if you have a question.`,
    },
    noReply: {
      name: 'noReply',
      text: '',
    },
    subscriptionStatusActive: {
      name: 'subscriptionStatusActive',
      text: activeStatusText,
    },
    subscriptionStatusLess: {
      name: 'subscriptionStatusLess',
      text: `Okay, great! I'll text you once a month with updates on what's happening in the news and/or easy ways for you to take action in your community! Wanna take 2 mins to learn how to spot the signs of an abusive relationship and what you can do about it? Read our guide here: ${newsUrl}`,
    },
    subscriptionStatusResubscribed: {
      name: 'subscriptionStatusResubscribed',
      text: activeStatusText,
    },
    subscriptionStatusStop: {
      name: 'subscriptionStatusStop',
      text: 'You\'re unsubscribed from DoSomething.org Alerts. No more msgs will be sent. Reply HELP for help. Text JOIN to receive 4-8 msgs/mth or LESS for 1msg/mth.',
    },
    supportRequested: {
      name: 'supportRequested',
      text: 'What\'s your question? I\'ll try my best to answer it.',
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
