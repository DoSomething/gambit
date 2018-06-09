'use strict';

const Chance = require('chance');
const stubs = require('../stubs');
const topicFactory = require('./topic');

const chance = new Chance();

const numericIdRange = {
  min: 1,
  max: 9999,
};

/**
 * @see https://github.com/DoSomething/gambit-campaigns/blob/master/documentation/endpoints/campaigns.md#retrieve-a-campaign
*/
function getValidCampaign() {
  const messageTemplate = stubs.getTemplate();
  const messageText = stubs.getRandomMessageText();
  const result = {
    id: chance.integer(numericIdRange),
    title: chance.sentence({ words: 3 }),
    currentCampaignRun: {
      id: chance.integer(numericIdRange),
    },
    keywords: [stubs.getKeyword()],
    botConfig: {
      postType: stubs.getPostType(),
      templates: {},
    },
    topics: [topicFactory.getValidTopic()],
  };
  result.botConfig.templates[messageTemplate] = {
    raw: messageText,
    rendered: messageText,
    override: true,
  };
  return result;
}

function getValidCampaignWithoutTopics() {
  const campaign = module.exports.getValidCampaign();
  campaign.topics = [];
  return campaign;
}

module.exports = {
  getValidCampaign,
  getValidCampaignWithoutTopics,
};
