'use strict';

const underscore = require('underscore');

const helpCenterUrl = 'http://doso.me/1jf4/291kep';
// TODO: DRY menuCommand definition.
// @see lib/helpers.js
const menuCommand = 'menu';


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
    invalidAskSignupResponse: 'invalidAskSignupResponse',
  },
  gambitCampaignsTemplates: {
    askCaption: 'askCaption',
    askPhoto: 'askPhoto',
    askQuantity: 'askQuantity',
    askText: 'askText',
    askWhyParticipated: 'askWhyParticipated',
    completedPhotoPost: 'completedPhotoPost',
    completedPhotoPostAutoReply: 'completedPhotoPostAutoReply',
    completedTextPost: 'completedTextPost',
    invalidCaption: 'invalidCaption',
    invalidPhoto: 'invalidPhoto',
    invalidQuantity: 'invalidQuantity',
    invalidText: 'invalidText',
    invalidWhyParticipated: 'invalidWhyParticipated',
    startExternalPost: 'startExternalPost',
    startExternalPostAutoReply: 'startExternalPostAutoReply',
    startPhotoPost: 'startPhotoPost',
    startPhotoPostAutoReply: 'startPhotoPostAutoReply',
    webAskText: 'webAskText',
    webStartExternalPost: 'webStartExternalPost',
    webStartPhotoPost: 'webStartPhotoPost',
  },
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
      text: `Sorry, I'm not sure how to respond to that.\n\nSay ${menuCommand.toUpperCase()} to find a Campaign to join.`,
    },
    noReply: {
      name: 'noReply',
      text: '',
    },
    subscriptionStatusActive: {
      name: 'subscriptionStatusActive',
      text: 'OK, great! You\'ll receive weekly updates from me. -Freddie, DoSomething.org.',
    },
    subscriptionStatusLess: {
      name: 'subscriptionStatusLess',
      text: 'OK, great! We\'ll start sending you updates monthly! If you want weekly, text WEEKLY -Freddie, DoSomething.org.',
    },
    subscriptionStatusResubscribed: {
      name: 'subscriptionStatusResubscribed',
      text: 'Welcome back! You\'ll receive weekly updates from me, or if you just want monthly texts, text LESS -Freddie, DoSomething.org.',
    },
    subscriptionStatusStop: {
      name: 'subscriptionStatusStop',
      text: `Ok, you'll stop getting texts from me. If you just want monthly texts, text LESS. Questions? ${helpCenterUrl}`,
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
