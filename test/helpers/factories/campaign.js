'use strict';

const Chance = require('chance');

const chance = new Chance();

const numericIdRange = {
  min: 1,
  max: 9999,
};

module.exports.getValidCampaign = function getValidCampaign() {
  return {
    id: chance.integer(numericIdRange),
    title: chance.sentence({ words: 3 }),
    currentCampaignRun: {
      id: chance.integer(numericIdRange),
    },
  };
};
