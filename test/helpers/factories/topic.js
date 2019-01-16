'use strict';

const stubs = require('../stubs');
const config = require('../../../config/lib/helpers/topic');

function getTemplate() {
  return stubs.getRandomMessageText();
}

/**
 * These topic stubs correspond to data returned from Gambit Content GET /topics/:id requests.
 * @see https://github.com/DoSomething/gambit-content/blob/master/documentation/endpoints/topics.md#retrieve-topic
 *
 * @param {String} type
 * @return {Object}
 */
function getValidTopic(type = 'photoPostConfig', templates = {}) {
  const sharedFields = {
    id: stubs.getContentfulId(),
    name: stubs.getRandomName(),
    type,
    campaign: {
      id: stubs.getCampaignId(),
    },
  };
  return Object.assign(sharedFields, templates);
}

function getValidTopicWithoutCampaign(type = 'photoPostConfig', templates) {
  const topic = getValidTopic(type, templates);
  topic.campaign = null;
  return topic;
}

function getValidAutoReply() {
  return getValidTopic(config.types.autoReply.type, { autoReply: getTemplate() });
}

// TODO: Remove this function once we deprecate externalPostConfig type entirely.
function getValidExternalPostConfig() {
  return getValidTopic(config.types.externalPostConfig.type, { startExternalPost: getTemplate() });
}

function getValidPhotoPostConfig() {
  const templates = {
    startPhotoPostAutoReply: getTemplate(),
    askQuantity: getTemplate(),
    invalidQuantity: getTemplate(),
    // TODO: Cleanup config/lib/helpers/template, possibly move into config/lib/helpers/topic
    // and use it to define the various templates per topic here.
  };
  return getValidTopic(config.types.photoPostConfig.type, templates);
}

function getValidTextPostConfig() {
  const templates = {
    invalidAskText: getTemplate(),
    completedTextPost: getTemplate(),
    completedTextPostAutoReply: getTemplate(),
  };
  return getValidTopic(config.types.textPostConfig.type, templates);
}

function getValidAskYesNoBroadcastTopic() {
  return getValidTopicWithoutCampaign(config.types.askYesNo.type, {
    invalidAskYesNoResponse: getTemplate(),
    saidNo: getTemplate(),
    saidNoTopic: getValidTopicWithoutCampaign(),
    saidYes: getTemplate(),
    saidYesTopic: getValidPhotoPostConfig(),
  });
}

module.exports = {
  getValidAskYesNoBroadcastTopic,
  getValidAutoReply,
  getValidExternalPostConfig,
  getValidPhotoPostConfig,
  getValidTextPostConfig,
  getValidTopic,
  getValidTopicWithoutCampaign,
};
