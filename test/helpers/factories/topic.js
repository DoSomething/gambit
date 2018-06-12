'use strict';

const stubs = require('../stubs');

function getValidTopic() {
  const result = {
    id: stubs.getContentfulId(),
    postType: stubs.getPostType(),
    templates: {},
    campaign: {
      id: stubs.getCampaignId(),
    },
  };
  const templateName = stubs.getTemplate();
  result.templates[templateName] = {
    raw: stubs.getRandomMessageText(),
    rendered: stubs.getRandomMessageText(),
    override: true,
  };
  return result;
}

function getValidTopicWithoutCampaign() {
  const topic = module.exports.getValidTopic();
  topic.campaign = null;
  return topic;
}

module.exports = {
  getValidTopic,
  getValidTopicWithoutCampaign,
};
