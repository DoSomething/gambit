'use strict';

const commands = {
  less: 'LESS',
  support: 'Q',
  stop: 'STOP',
};

const supportText = `Text ${commands.support} if you have a question.`;

module.exports = {
  badWords: {
    name: 'badWords',
    text: `Not cool. I'm a real person & that offends me. I send out these texts to help young ppl take action. If you don't want my texts, text ${commands.stop} or ${commands.less} to get less.`,
  },
  campaignClosed: {
    name: 'campaignClosed',
    text: process.env.GAMBIT_CONVERSATIONS_CAMPAIGN_CLOSED_TEXT || `Sorry, {{topic.campaign.internalTitle}} is no longer available. ${supportText}`,
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
