'use strict';

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
    'askWhyParticipated',
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
    noCampaign: `Sorry, I'm not sure how to respond to that.\n\nSay ${menuCommand.toUpperCase()} to find a Campaign to join.`,
    subscriptionStatusLess: 'Sure, we\'ll only message you once a month.',
    subscriptionStatusStop: 'You\'ve been unsubscribed.',
  },
  menuCommand,
  macros: {
    confirmedCampaign: 'confirmedCampaign',
    declinedCampaign: 'declinedCampaign',
    gambit: 'gambit',
    subscriptionStatusLess: 'subscriptionStatusLess',
    subscriptionStatusStop: 'subscriptionStatusStop',
  },
};
