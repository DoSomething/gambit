'use strict';

const stubs = require('../stubs');
const config = require('../../../config/lib/helpers/topic');

function getTemplate(newTopic) {
  return {
    text: stubs.getRandomMessageText(),
    topic: newTopic || {},
  };
}
/**
 * These topic stubs correspond to data returned from Gambit Content GET /topics/:id requests.
 * @see https://github.com/DoSomething/gambit-campaigns/blob/master/documentation/endpoints/topics.md#retrieve-topic
 *
 * @param {String} type
 * @return {Object}
 */
function getValidTopic(type = 'photoPostConfig', templates) {
  return {
    id: stubs.getContentfulId(),
    name: stubs.getRandomName(),
    type,
    postType: stubs.getPostType(),
    campaign: {
      id: stubs.getCampaignId(),
    },
    templates,
  };
}

function getValidTopicWithoutCampaign() {
  const topic = getValidTopic();
  topic.campaign = null;
  return topic;
}

function getValidAutoReply() {
  return getValidTopic(config.types.autoReply, { autoReply: getTemplate() });
}

// TODO: Remove this function once we deprecate externalPostConfig type entirely.
function getValidExternalPostConfig() {
  return getValidTopic(config.types.externalPostConfig, { startExternalPost: getTemplate() });
}

function getValidPhotoPostConfig() {
  const templates = {
    // TODO: Remove startPhotoPost once deprecated by defaultTopicTrigger transitions.
    startPhotoPost: getTemplate(),
    startPhotoPostAutoReply: getTemplate(),
    askQuantity: getTemplate(),
    invalidQuantity: getTemplate(),
    // TODO: Cleanup config/lib/helpers/template, possibly move into config/lib/helpers/topic
    // and use it to define the various templates per topic here.
  };
  return getValidTopic(config.types.photoPostConfig, templates);
}

function getValidTextPostConfig() {
  const templates = {
    // TODO: Remove askText once deprecated by defaultTopicTrigger transitions.
    askText: getTemplate(),
    invalidAskText: getTemplate(),
    completedTextPost: getTemplate(),
    completedTextPostAutoReply: getTemplate(),
  };
  return getValidTopic(config.types.textPostConfig, templates);
}

module.exports = {
  getValidAutoReply,
  getValidExternalPostConfig,
  getValidPhotoPostConfig,
  getValidTextPostConfig,
  getValidTopic,
  getValidTopicWithoutCampaign,
};
