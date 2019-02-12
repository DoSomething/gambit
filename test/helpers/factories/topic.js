'use strict';

const stubs = require('../stubs');
const config = require('../../../config/lib/helpers/topic');

function getTemplate() {
  return stubs.getRandomMessageText();
}

/**
 * These topic stubs correspond to data returned from Query.topic GraphQL requests.
 * @see https://github.com/DoSomething/gambit-content/blob/master/documentation/endpoints/topics.md#retrieve-topic
 *
 * @param {String} type
 * @param {Object} templates
 * @return {Object}
 */
function getValidTopic(type = 'photoPostConfig', templates = {}) {
  return {
    id: stubs.getContentfulId(),
    name: stubs.getRandomName(),
    type,
    contentType: type,
    campaign: {
      id: stubs.getCampaignId(),
    },
    ...templates,
  };
}

/**
 * @param {String} type
 * @param {Object} templates
 * @return {Object}
 */
function getValidTopicWithoutCampaign(type = 'photoPostConfig', templates) {
  const result = getValidTopic(type, templates);
  delete result.campaign;
  return result;
}

/**
 * @return {Object}
 */
function getValidAutoReply() {
  return getValidTopic(config.types.autoReply.type, { autoReply: getTemplate() });
}

/**
 * @return {Object}
 */
function getValidPhotoPostConfig() {
  return getValidTopic(config.types.photoPostConfig.type, {
    startPhotoPostAutoReply: getTemplate(),
    askQuantity: getTemplate(),
    invalidQuantity: getTemplate(),
    // TODO: Cleanup config/lib/helpers/template, possibly move into config/lib/helpers/topic
    // and use it to define the various templates per topic here.
  });
}

/**
 * @return {Object}
 */
function getValidTextPostConfig() {
  return getValidTopic(config.types.textPostConfig.type, {
    invalidAskText: getTemplate(),
    completedTextPost: getTemplate(),
    completedTextPostAutoReply: getTemplate(),
  });
}

/**
 * @return {Object}
 */
function getValidAskSubscriptionStatusBroadcastTopic() {
  return getValidTopicWithoutCampaign(config.types.askSubscriptionStatus.type, {
    invalidAskSubscriptionStatusResponse: getTemplate(),
    saidActive: getTemplate(),
    saidActiveTopic: getValidTopicWithoutCampaign(),
    saidLess: getTemplate(),
    saidLessTopic: getValidTopicWithoutCampaign(),
  });
}

/**
 * @return {Object}
 */
function getValidAskVotingPlanStatusBroadcastTopic() {
  return getValidTopicWithoutCampaign(config.types.askVotingPlanStatus.type, {
    saidCantVote: getTemplate(),
    saidCantVoteTopic: getValidTopicWithoutCampaign(),
    saidNotVoting: getTemplate(),
    saidNotVotingTopic: getValidTopicWithoutCampaign(),
    saidVoting: getTemplate(),
    saidVotingTopic: getValidTopicWithoutCampaign(),
  });
}

/**
 * @return {Object}
 */
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
  getValidAskSubscriptionStatusBroadcastTopic,
  getValidAskVotingPlanStatusBroadcastTopic,
  getValidAskYesNoBroadcastTopic,
  getValidAutoReply,
  getValidPhotoPostConfig,
  getValidTextPostConfig,
  getValidTopic,
  getValidTopicWithoutCampaign,
};
