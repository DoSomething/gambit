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
  return {
    id: chance.integer(numericIdRange),
    title: chance.sentence({ words: 3 }),
    currentCampaignRun: {
      id: chance.integer(numericIdRange),
    },
    config: {
      id: stubs.getContentfulId(),
      templates: {
        webSignup: {
          text: stubs.getRandomMessageText(),
          attachments: [stubs.getAttachment()],
          template: 'webSignup',
          topic: topicFactory.getValidTopic(),
        },
      },
    },
  };
}

function getValidCampaignWithoutWebSignup() {
  const campaign = module.exports.getValidCampaign();
  campaign.config.templates.webSignup = {};
  return campaign;
}

module.exports = {
  getValidCampaign,
  getValidCampaignWithoutWebSignup,
};
