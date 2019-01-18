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
 * Returns a mock result from a Gambit Content GET /campaigns/:id request.
 * @see https://github.com/DoSomething/gambit-content/blob/master/documentation/endpoints/campaigns.md#retrieve-a-campaign
 *
 * @return {Object}
*/
function getValidCampaign() {
  return {
    id: chance.integer(numericIdRange),
    title: chance.sentence({ words: 3 }),
    internalTitle: chance.sentence({ words: 3 }),
    endDate: null,
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

/**
 * @return {Object}
 */
function getValidCampaignWithoutWebSignup() {
  const campaign = module.exports.getValidCampaign();
  campaign.config.templates.webSignup = {};
  return campaign;
}

/**
 * @return {Object}
 */
function getValidClosedCampaign() {
  return { ...module.exports.getValidCampaign(), endDate: '2018-07-19T00:00:00Z' };
}

module.exports = {
  getValidCampaign,
  getValidCampaignWithoutWebSignup,
  getValidClosedCampaign,
};
