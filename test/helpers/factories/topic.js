'use strict';

const stubs = require('../stubs');
const config = require('../../../config/lib/helpers/topic');


function getValidTopic(type = 'photoPostConfig') {
  const result = {
    id: stubs.getContentfulId(),
    name: stubs.getRandomName(),
    type,
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
    text: stubs.getRandomMessageText(),
    override: true,
  };
  return result;
}

function getValidTopicWithoutCampaign() {
  const topic = getValidTopic();
  topic.campaign = null;
  return topic;
}

function getValidAutoReply() {
  return getValidTopic(config.types.autoReply);
}

function getValidTextPostConfig() {
  const topic = getValidTopic(config.types.textPostConfig);
  topic.templates = {
    // Note: this field will be removed once we deprecate saving topics to the reference field
    // on a defaultTopicTrigger.
    askText: {
      text: stubs.getRandomMessageText(),
      topic: {},
    },
    invalidAskText: {
      text: stubs.getRandomMessageText(),
      topic: {},
    },
    completedTextPost: {
      text: stubs.getRandomMessageText(),
      topic: {},
    },
    completedTextPostAutoReply: {
      text: stubs.getRandomMessageText(),
      topic: {},
    },
  };
  return topic;
}

module.exports = {
  getValidAutoReply,
  getValidTextPostConfig,
  getValidTopic,
  getValidTopicWithoutCampaign,
};
