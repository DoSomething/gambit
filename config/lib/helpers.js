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
  menuCommand,
  macros: {
    confirmedCampaign: 'confirmedCampaign',
    declinedCampaign: 'declinedCampaign',
    gambit: 'gambit',
    sendCrisisMessage: 'sendCrisisMessage',
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
