'use strict';

const graphql = require('../graphql');
const helpers = require('../helpers');
const logger = require('../logger');
const config = require('../../config/lib/helpers/topic');
const broadcastConfig = require('../../config/lib/helpers/broadcast');
const repliesConfig = require('../../config/lib/helpers/replies');
// TODO: Move templateConfig into repliesConfig.
const templateConfig = require('../../config/lib/helpers/template');

/**
 * @param {String} id
 * @return {Promise}
 */
async function fetchById(id) {
  logger.debug('Fetching topic', { id });

  const topic = await graphql.fetchTopicById(id);

  // TODO: Refactor codebase to check for the topic GraphQL __typename, not the Contentful type name
  Object.assign(topic, { type: topic.contentType });

  return helpers.cache.topics.set(id, topic);
}

/**
 * @param {String} id
 * @return {Promise}
 */
async function getById(id) {
  if (module.exports.isRivescriptTopicId(id)) {
    return module.exports.getRivescriptTopicById(id);
  }

  const topic = await helpers.cache.topics.get(id);

  if (topic) {
    logger.debug('Topic cache hit', { id });
    return topic;
  }

  logger.debug('Topic cache miss', { id });
  return module.exports.fetchById(id);
}

/**
 * @return {Object}
 */
function getDefaultTopic() {
  return config.rivescriptTopics.default;
}

/**
 * @return {String}
 */
function getDefaultTopicId() {
  return getDefaultTopic().id;
}

/**
 * @return {Object}
 */
function getPhotoPostDraftSubmissionValuesMap() {
  return config.types.photoPostConfig.draftSubmissionValuesMap;
}

/**
 * @param {String} topicId
 * @return {Object}
 */
function getRivescriptTopicById(topicId) {
  return {
    id: topicId,
    type: 'rivescript',
    name: topicId,
  };
}

/**
 * @param {Object} topic
 * @param {String} templateName
 * @return {String}
 */
function getTopicTemplateText(topic, templateName) {
  const result = topic[templateName];
  if (!result) {
    throw new Error(`Template ${templateName} undefined for topic ${topic.id}`);
  }
  return result;
}

/**
 * @return {Object}
 */
function getSupportTopic() {
  return config.rivescriptTopics.support;
}

/**
 * Return the outbound template name to use for triggers that transition to this topic.
 *
 * @param {Object} topic
 * @return {String}
 */
function getTransitionTemplateName(topic) {
  if (module.exports.hasClosedCampaign(topic)) {
    return repliesConfig.campaignClosed.name;
  }

  const topicTypeConfig = config.types[topic.type];
  if (topicTypeConfig && topicTypeConfig.transitionTemplate) {
    return topicTypeConfig.transitionTemplate;
  }

  return templateConfig.templatesMap.rivescriptReply;
}

/**
 * @return {Object}
 */
function getUnsubscribedTopic() {
  return config.rivescriptTopics.unsubscribed;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function hasActiveCampaign(topic) {
  return module.exports.hasCampaign(topic) && !helpers.campaign.isClosedCampaign(topic.campaign);
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function hasCampaign(topic) {
  return topic.campaign && topic.campaign.id;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function hasClosedCampaign(topic) {
  return module.exports.hasCampaign(topic) && helpers.campaign.isClosedCampaign(topic.campaign);
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isAskMultipleChoice(topic) {
  return topic.type === config.types.askMultipleChoice.type;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isAskSubscriptionStatus(topic) {
  return topic.type === config.types.askSubscriptionStatus.type;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isAskVotingPlanStatus(topic) {
  return topic.type === config.types.askVotingPlanStatus.type;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isAskYesNo(topic) {
  return topic.type === config.types.askYesNo.type;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isAutoReply(topic) {
  return topic.type === config.types.autoReply.type;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isBroadcastable(topic) {
  return broadcastConfig.types[topic.type];
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isPhotoPostConfig(topic) {
  return topic.type === config.types.photoPostConfig.type;
}

/**
 * @param {String} topicId
 * @return {Boolean}
 */
function isRivescriptTopicId(topicId) {
  const deparsed = helpers.rivescript.getDeparsedRivescript();
  return !!deparsed.topics[topicId];
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isTextPostConfig(topic) {
  return topic.type === config.types.textPostConfig.type;
}

/**
 * @param {String} topicId
 * @return {Boolean}
 */
function isDefaultTopicId(topicId) {
  return topicId === getDefaultTopicId();
}

module.exports = {
  fetchById,
  getById,
  getDefaultTopic,
  getDefaultTopicId,
  getPhotoPostDraftSubmissionValuesMap,
  getRivescriptTopicById,
  getSupportTopic,
  getTopicTemplateText,
  getTransitionTemplateName,
  getUnsubscribedTopic,
  hasActiveCampaign,
  hasCampaign,
  hasClosedCampaign,
  isAskMultipleChoice,
  isAskSubscriptionStatus,
  isAskVotingPlanStatus,
  isAskYesNo,
  isAutoReply,
  isBroadcastable,
  isDefaultTopicId,
  isPhotoPostConfig,
  isRivescriptTopicId,
  isTextPostConfig,
};
