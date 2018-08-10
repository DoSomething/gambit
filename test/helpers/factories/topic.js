'use strict';

const stubs = require('../stubs');
const broadcastFactory = require('./broadcast');
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

function getValidAskYesNo() {
  return broadcastFactory.getValidAskYesNo();
}

function getValidAutoReply() {
  return getValidTopic(config.types.autoReply);
}

function getValidTextPostConfig() {
  return getValidTopic(config.types.textPostConfig);
}

module.exports = {
  getValidAskYesNo,
  getValidAutoReply,
  getValidTextPostConfig,
  getValidTopic,
  getValidTopicWithoutCampaign,
};
