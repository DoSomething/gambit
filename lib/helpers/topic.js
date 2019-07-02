'use strict';

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
  // TODO: Refactor codebase to check for the topic GraphQL __typename, not the Contentful type name
  topic.type = topic.contentType; // eslint-disable-line

  let transformedTopic = topic;

  if (module.exports.isAskMultipleChoice(topic)) {
    transformedTopic = {
      ...topic,
      saidFirstChoice: topic.saidFirstChoiceTransition.text,
      saidFirstChoiceTopic: topic.saidFirstChoiceTransition.topic,
      saidSecondChoice: topic.saidSecondChoiceTransition.text,
      saidSecondChoiceTopic: topic.saidSecondChoiceTransition.topic,
      saidThirdChoice: topic.saidThirdChoiceTransition.text,
      saidThirdChoiceTopic: topic.saidThirdChoiceTransition.topic,
      // Optional
      saidFourthChoice: topic.saidFourthChoiceTransition ?
        topic.saidFourthChoiceTransition.text : null,
      saidFourthChoiceTopic: topic.saidFourthChoiceTransition ?
        topic.saidFourthChoiceTransition.topic : null,
      saidFifthChoice: topic.saidFifthChoiceTransition ?
        topic.saidFifthChoiceTransition.text : null,
      saidFifthChoiceTopic: topic.saidFifthChoiceTransition ?
        topic.saidFifthChoiceTransition.topic : null,
    };
  }
  if (module.exports.isAskSubscriptionStatus(topic)) {
    transformedTopic = {
      ...topic,
      saidActive: topic.saidActiveTransition.text,
      saidActiveTopic: topic.saidActiveTransition.topic,
      saidLess: topic.saidLessTransition.text,
      saidLessTopic: topic.saidLessTransition.topic,
    };
  }
  if (module.exports.isAskVotingPlanStatus(topic)) {
    transformedTopic = {
      ...topic,
      saidCantVote: topic.saidCantVoteTransition.text,
      saidCantVoteTopic: topic.saidCantVoteTransition.topic,
      saidNotVoting: topic.saidNotVotingTransition.text,
      saidNotVotingTopic: topic.saidNotVotingTransition.topic,
      saidVoted: topic.saidVotedTransition.text,
      saidVotedTopic: topic.saidVotedTransition.topic,
    };
  }
  if (module.exports.isAskYesNo(topic)) {
    transformedTopic = {
      ...topic,
      saidNo: topic.saidNoTransition.text,
      saidNoTopic: topic.saidNoTransition.topic,
      saidYes: topic.saidYesTransition.text,
      saidYesTopic: topic.saidYesTransition.topic,
    };
  }
  return transformedTopic;
};

/**
 * @param {String} id
 * @return {Promise}
 */
async function fetchById(id) {
  logger.debug('Fetching topic', { id });

  const topic = topicTransformer(await graphql.fetchTopicById(id));

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
  isDefaultTopicId,
  isPhotoPostConfig,
  isRivescriptTopicId,
  isTextPostConfig,
};
