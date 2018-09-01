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
      templates: {
        webSignup: {
          text: stubs.getRandomMessageText(),
          attachments: [stubs.getAttachment()],
          template: 'webSignup',
          topic: topicFactory.getValidTopic(),
        },
      },
    },
    // TODO: This will be deprecated. The only place we use this currently is if user is in a random
    // topic, and we look for a topic per the last campaign saved to conversation. This will be
    // removed once topics like ask_subscription_status place users into an autoReply, which should
    // contain a conversion point (either a web link, or topic change trigger).
    topics: [topicFactory.getValidTopicWithoutCampaign()],
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
