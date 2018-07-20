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
  if (module.exports.isRandomTopicId(topicId)) {
    return Promise.reject({ status: 404 });
  }
  if (module.exports.isHardcodedTopicId(topicId)) {
    return Promise.resolve(topicId);
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
 * @param {Object} topic
 * @param {String} templateName
 */
function getRenderedTextFromTopicAndTemplateName(topic, templateName) {
  return topic.templates[templateName].rendered;
}

/**
 * @param {String} topicId
 * @return {Boolean}
 */
function isHardcodedTopicId(topicId) {
  return config.hardcodedTopicIds.includes(topicId);
}

/**
 * @param {String} topicId
 * @return {Boolean}
 */
function isRandomTopicId(topicId) {
  return topicId === config.randomTopicId;
}


module.exports = {
  fetchById,
  fetchByCampaignId,
  getRenderedTextFromTopicAndTemplateName,
  isHardcodedTopicId,
  isRandomTopicId,
};
