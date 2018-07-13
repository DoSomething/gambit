'use strict';

function getValidCampaignBroadcast() {
  return {
    id: '38Diqre71mCa2WIsGCIyus',
    name: 'FeedingBetterFutures2018_Jan30_Niche_TestA',
    createdAt: '2018-01-30T16:40:03.664Z',
    updatedAt: '2018-01-30T16:40:31.526Z',
    message: {
      text: 'Hi it\'s Freddie with a new scholarship opportunity! Today share a fact about food related issues online for the chance to win a $5K scholarship. You in? Y or N?',
      attachments: [],
      template: 'askSignup',
    },
    campaignId: 7984,
  };
}

function getValidTopicBroadcast() {
  return {
    id: 'Z4LXfz4AEeWGMCIqAooM2',
    name: 'GunViolence2018_March20_WeekOfAction_Day2_Attending',
    createdAt: '2018-03-20T16:36:38.959Z',
    updatedAt: '2018-03-20T16:38:07.045Z',
    message: {
      text: 'Hi it’s Freddie again! Just 4 more days until the March For Our Lives. I\'ll be attending the NYC march with the DoSomething staff and friends. Who will you march with? \n\nClick here to find a march near you and tag a friend who you want to invite: https://www.dosomething.org/us/campaigns/do-something-about-gun-violence/blocks/4grHyJPp60wecqmkOCG8UY?id={{user.id}}\n\n',
      attachments: [],
      template: 'rivescript',
    },
    topic: 'survey_response',
  };
}

module.exports = {
  getValidCampaignBroadcast,
  getValidTopicBroadcast,
};
