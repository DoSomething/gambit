'use strict';

module.exports = {
  campaignClosed: {
    name: 'campaignClosed',
    text: process.env.GAMBIT_CONVERSATIONS_CAMPAIGN_CLOSED_TEXT || 'Sorry, {{topic.campaign.title}} is no longer available.',
  },
};
