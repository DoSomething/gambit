'use strict';

const lodash = require('lodash');

const graphql = require('../graphql');
const helpers = require('../helpers');
const logger = require('../logger');
const config = require('../../config/lib/helpers/topic');
const repliesConfig = require('../../config/lib/helpers/replies');
// TODO: Move templateConfig into repliesConfig.
const templateConfig = require('../../config/lib/helpers/template');
/**
 * Transforms GraphQL response to be compatible with the legacy contract.
 * @param {Topic} topic
 */
const topicTransformer = (topic) => {
  const transformedTopic = lodash.cloneDeep(topic);
  // TODO: Refactor codebase to check for the topic GraphQL __typename, not the Contentful type name
  transformedTopic.type = transformedTopic.contentType; // eslint-disable-line

  if (module.exports.isAskMultipleChoice(transformedTopic)) {
    transformedTopic.saidFirstChoice = topic.saidFirstChoiceTransition.text;
    transformedTopic.saidFirstChoiceTopic = topic.saidFirstChoiceTransition.topic;
    transformedTopic.saidSecondChoice = topic.saidSecondChoiceTransition.text;
    transformedTopic.saidSecondChoiceTopic = topic.saidSecondChoiceTransition.topic;
    transformedTopic.saidThirdChoice = topic.saidThirdChoiceTransition.text;
    transformedTopic.saidThirdChoiceTopic = topic.saidThirdChoiceTransition.topic;
    // Optional
    transformedTopic.saidFourthChoice = topic.saidFourthChoiceTransition ?
      topic.saidFourthChoiceTransition.text : null;
    transformedTopic.saidFourthChoiceTopic = topic.saidFourthChoiceTransition ?
      topic.saidFourthChoiceTransition.topic : null;
    transformedTopic.saidFifthChoice = topic.saidFifthChoiceTransition ?
      topic.saidFifthChoiceTransition.text : null;
    transformedTopic.saidFifthChoiceTopic = topic.saidFifthChoiceTransition ?
      topic.saidFifthChoiceTransition.topic : null;
  }
  if (module.exports.isAskSubscriptionStatus(transformedTopic)) {
    transformedTopic.saidActive = topic.saidActiveTransition.text;
    transformedTopic.saidActiveTopic = topic.saidActiveTransition.topic;
    transformedTopic.saidLess = topic.saidLessTransition.text;
    transformedTopic.saidLessTopic = topic.saidLessTransition.topic;
  }
  if (module.exports.isAskVotingPlanStatus(transformedTopic)) {
    transformedTopic.saidCantVote = topic.saidCantVoteTransition.text;
    transformedTopic.saidCantVoteTopic = topic.saidCantVoteTransition.topic;
    transformedTopic.saidNotVoting = topic.saidNotVotingTransition.text;
    transformedTopic.saidNotVotingTopic = topic.saidNotVotingTransition.topic;
    transformedTopic.saidVoted = topic.saidVotedTransition.text;
    transformedTopic.saidVotedTopic = topic.saidVotedTransition.topic;
  }
  if (module.exports.isAskYesNo(transformedTopic)) {
    transformedTopic.saidNo = topic.saidNoTransition.text;
    transformedTopic.saidNoTopic = topic.saidNoTransition.topic;
    transformedTopic.saidYes = topic.saidYesTransition.text;
    transformedTopic.saidYesTopic = topic.saidYesTransition.topic;
  }
  return transformedTopic;
};

/**
 * @param {String} id
 * @return {Promise}
 */
const fetchers = {};
async function fetchById(id) {
  // If we have an in-flight request, return existing promise:
  if (fetchers[id]) {
    logger.debug('Using pending request for topic', { id });
    return fetchers[id];
  }

  // Otherwise, start a new request, keeping a record of it
  // in case we fetch this same ID again before it resolves:
  logger.debug('Fetching topic', { id });
  fetchers[id] = graphql.fetchTopicById(id);

  const topic = topicTransformer(await fetchers[id]);

  // Once we've finished the request, store the result
  // in cache and clear our "pending request" record:
  helpers.cache.topics.set(id, topic);
  delete fetchers[id];

  return topic;
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
 * @param {Object} topic
 * @return {Boolean}
 */
function isVolunteerCredit(topic) {
  return lodash.get(topic, 'action.volunteerCredit', false);
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
  isDefaultTopicId,
  isPhotoPostConfig,
  isRivescriptTopicId,
  isTextPostConfig,
  isVolunteerCredit,
};
