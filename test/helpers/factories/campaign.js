'use strict';

const Chance = require('chance');
const stubs = require('../stubs');

const chance = new Chance();

const numericIdRange = {
  min: 1,
  max: 9999,
};

/**
 * @see https://github.com/DoSomething/gambit-campaigns/blob/master/documentation/endpoints/campaigns.md#retrieve-a-campaign
*/
module.exports.getValidCampaign = function getValidCampaign() {
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
  };
  result.botConfig.templates[messageTemplate] = {
    raw: messageText,
    rendered: messageText,
    override: true,
  };
  return result;
};
