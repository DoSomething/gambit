'use strict';

const gambitCampaigns = require('../gambit-campaigns');
const helpers = require('../helpers');
const logger = require('../logger');
const config = require('../../config/lib/helpers/topic');
const broadcastConfig = require('../../config/lib/helpers/broadcast');

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
 * @param {String} topicId
 * @return {Promise}
 */
async function getById(topicId) {
  if (module.exports.isRivescriptTopicId(topicId)) {
    return module.exports.getRivescriptTopicById(topicId);
  }
  return module.exports.fetchById(topicId);
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
function getTopicTemplateText(topic, templateName) {
  return topic.templates[templateName].text;
}

/**
 * TODO: Remove this function once all default topic triggers are backfilled with transitions.
 * @see lib/helpers/rivescript.getReplyRivescript
 *
 * @param {Object} topic
 * @return {String}
 */
function getStartTemplateText(topic) {
  const type = topic.type;
  const templates = topic.templates;
  if (type === 'photoPostConfig') {
    return templates.startPhotoPost.text;
  }
  if (type === 'textPostConfig') {
    return templates.askText.text;
  }
  if (type === 'externalPostConfig') {
    return templates.startExternalPost.text;
  }
  return null;
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
function isAskVotingPlanStatus(topic) {
  return topic.type === config.types.askVotingPlanStatus;
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
 * @param {Object} topic
 * @return {Boolean}
 */
function isBroadcastable(topic) {
  return broadcastConfig.types[topic.type];
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
  getById,
  getDefaultTopic,
  getDefaultTopicId,
  getTopicTemplateText,
  getRivescriptTopicById,
  getStartTemplateText,
  getSupportTopic,
  hasCampaign,
  isAskSubscriptionStatus,
  isAskVotingPlanStatus,
  isAskYesNo,
  isAutoReply,
  isBroadcastable,
  isDefaultTopicId,
  isRivescriptTopicId,
};
