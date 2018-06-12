'use strict';

const stubs = require('../stubs');

function getValidTopic() {
  return {
    id: stubs.getContentfulId(),
    postType: stubs.getPostType(),
    templates: {},
    campaign: {
      id: stubs.getCampaignId(),
    },
  };
}

module.exports = {
  getValidTopic,
};
