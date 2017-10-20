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
    subscriptionStatusLess: 'OK, great! We\'ll start sending you updates monthly instead of weekly! -Freddie, DoSomething.org.',
    subscriptionStatusStop: `Ok, you'll stop getting texts from me. If you just want monthly texts, text LESS. Questions? ${helpCenterUrl}. If you wish to unsubscribe, do not respond to this message.`,
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
