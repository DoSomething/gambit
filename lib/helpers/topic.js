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
  if (module.exports.isDefaultTopicId(topicId)) {
    return Promise.reject({ status: 404 });
  }
  if (module.exports.isRivescriptTopicId(topicId)) {
    return Promise.resolve(module.exports.getRivescriptTopicById(topicId));
  }
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
function isAutoReplyTopic(topic) {
  return config.autoReplyTopics.includes(topic.type);
}

/**
 * @param {String} topicId
 * @return {Boolean}
 */
function isRivescriptTopicId(topicId) {
  return config.hardcodedTopicIds.includes(topicId);
}

/**
 * @param {String} topicId
 * @return {Boolean}
 */
function isDefaultTopicId(topicId) {
  return topicId === config.rivescriptTopics.default.id;
}


module.exports = {
  fetchById,
  fetchByCampaignId,
  getRenderedTextFromTopicAndTemplateName,
  getRivescriptTopicById,
  isAutoReplyTopic,
  isDefaultTopicId,
  isRivescriptTopicId,
  isAskSubscriptionStatus,
};
