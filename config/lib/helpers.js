'use strict';

const helpCenterUrl = 'http://doso.me/1jf4/291kep';
const menuCommand = 'menu';

module.exports = {
  askContinueTemplates: [
    'askContinue',
    'invalidAskContinueResponse',
  ],
  askSignupTemplates: [
    'askSignup',
    'invalidAskSignupResponse',
  ],
  gambitCampaignsTemplates: [
    'askCaption',
    'askPhoto',
    'askQuantity',
    'askWhyParticipated',
    'completedMenu',
    'externalSignupMenu',
    'gambitSignupMenu',
    'invalidCaption',
    'invalidCompletedMenuCommand',
    'invalidPhoto',
    'invalidQuantity',
    'invalidSignupMenuCommand',
    'invalidWhyParticipated',
  ],
  gambitConversationsTemplateText: {
    info: `These are Do Something Alerts - 4 messages/mo. Info help@dosomething.org or ${helpCenterUrl}. Txt STOP to quit. Msg&Data Rates May Apply.`,
    noCampaign: `Sorry, I'm not sure how to respond to that.\n\nSay ${menuCommand.toUpperCase()} to find a Campaign to join.`,
    noReply: '',
    subscriptionStatusLess: 'Sure, we\'ll only message you once a month.',
    subscriptionStatusStop: 'You\'ve been unsubscribed.',
    supportRequested: 'What\'s your question? I\'ll try my best to answer it.',
  },
  menuCommand,
  macros: {
    confirmedCampaign: 'confirmedCampaign',
    declinedCampaign: 'declinedCampaign',
    gambit: 'gambit',
    sendInfoMessage: 'sendInfoMessage',
    subscriptionStatusLess: 'subscriptionStatusLess',
    subscriptionStatusStop: 'subscriptionStatusStop',
    supportRequested: 'supportRequested',
  },
  subscriptionStatusValues: {
    active: 'active',
    less: 'less',
    stop: 'undeliverable',
  },
  blinkSupressHeaders: 'x-blink-retry-suppress',
};
