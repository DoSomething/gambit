'use strict';

const commands = {
  less: 'LESS',
  support: 'Q',
  stop: 'STOP',
};

const supportText = `Text ${commands.support} if you have a question.`;

// Static Templates
module.exports = {
  askHoursSpent: {
    name: 'askHoursSpent',
    text: 'How many hours did this action take?',
  },
  badWords: {
    name: 'badWords',
    text: `Not cool. I'm a real person & that offends me. I send out these texts to help young ppl take action. If you don't want my texts, text ${commands.stop} or ${commands.less} to get less.`,
  },
  campaignClosed: {
    name: 'campaignClosed',
    text: process.env.GAMBIT_CONVERSATIONS_CAMPAIGN_CLOSED_TEXT || `Sorry, this campaign is no longer available. ${supportText}`,
  },
  invalidHoursSpent: {
    name: 'invalidHoursSpent',
    text: 'Whoops, I didn\'t understand that. How many hours did this action take? Be sure to text in a number, not a word (i.e. “4”, not “four”)',
  },
  noCampaign: {
    name: 'noCampaign',
    text: `Sorry, I'm not sure how to respond to that.\n\n${supportText}`,
  },
  noReply: {
    name: 'noReply',
    text: '',
  },
};
