'use strict';

const gambitCampaigns = require('../gambit-campaigns');
const helpers = require('../helpers');
const logger = require('../logger');
const config = require('../../config/lib/helpers/topic');

/**
 * @param {String} topicId
 * @return {Promise}
 */
function fetchById(topicId) {
  logger.debug('helpers.topic.fetchById', { topicId });
  return gambitCampaigns.fetchTopicById(topicId);
}

/**
 * @param {Number} campaignId
 * @return {Promise}
 */
function fetchByCampaignId(campaignId) {
  logger.debug('helpers.topic.fetchByCampaignId', { campaignId });
  return helpers.campaign.fetchById(campaignId)
    .then(campaign => campaign.topics.map(topic => Object.assign(topic, { campaign })));
}

/**
 * @return {Object}
 */
function getAskSubscriptionStatusTopic() {
  return config.rivescriptTopics.askSubscriptionStatus;
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
 */
function getRenderedTextFromTopicAndTemplateName(topic, templateName) {
  const template = topic.templates[templateName];
  // This rendered property will eventually get phased out, always query by text.
  return template.rendered || template.text;
}

/**
 * @return {Object}
 */
function getSupportTopic() {
  return config.rivescriptTopics.support;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function hasCampaign(topic) {
  logger.debug('topic.hasCampaign');
  return topic.campaign && topic.campaign.id;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isAskSubscriptionStatus(topic) {
  return topic.id === config.rivescriptTopics.askSubscriptionStatus.id;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isAskYesNo(topic) {
  return topic.type === config.types.askYesNo;
}

/**
 * @param {Object} topic
 * @return {Boolean}
 */
function isAutoReply(topic) {
  return topic.type === config.types.autoReply;
}

/**
 * @param {String} topicId
 * @return {Boolean}
 */
function isRivescriptTopicId(topicId) {
  // TODO: Inspect id's of the rivescriptTopic object values to deprecate hardcodedTopicIds config.
  return config.hardcodedTopicIds.includes(topicId);
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
  fetchByCampaignId,
  getAskSubscriptionStatusTopic,
  getDefaultTopic,
  getDefaultTopicId,
  getRenderedTextFromTopicAndTemplateName,
  getRivescriptTopicById,
  getSupportTopic,
  hasCampaign,
  isAskSubscriptionStatus,
  isAskYesNo,
  isAutoReply,
  isDefaultTopicId,
  isRivescriptTopicId,
};
