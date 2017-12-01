'use strict';

const helpCenterUrl = 'http://doso.me/1jf4/291kep';
// TODO: DRY menuCommand definition.
// @see lib/helpers.js
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
  templateText: {
    badWords: 'Not cool. I\'m a real person & that offends me. I send out these texts to help young ppl take action. If you don\'t want my texts, text STOP or LESS to get less.',
    crisis: 'Thanks for being brave and sharing that. If you want to talk to someone, our friends at CTL are here for you 24/7. Just send a text to 741741. Theyll listen!',
    info: `These are Do Something Alerts - 4 messages/mo. Info help@dosomething.org or ${helpCenterUrl}. Txt STOP to quit. Msg&Data Rates May Apply.`,
    noCampaign: `Sorry, I'm not sure how to respond to that.\n\nSay ${menuCommand.toUpperCase()} to find a Campaign to join.`,
    noReply: '',
    subscriptionStatusLess: 'OK, great! We\'ll start sending you updates monthly instead of weekly! -Freddie, DoSomething.org.',
    subscriptionStatusStop: `Ok, you'll stop getting texts from me. If you just want monthly texts, text LESS. Questions? ${helpCenterUrl}. If you wish to unsubscribe, do not respond to this message.`,
    supportRequested: 'What\'s your question? I\'ll try my best to answer it.',
  },
};
