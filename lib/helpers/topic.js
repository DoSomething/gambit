'use strict';

const gambitCampaigns = require('../gambit-campaigns');
const helpers = require('../helpers');
const logger = require('../logger');

/**
 * Queries Content API for first page of defaultTopicTriggers and returns as an array of
 * Rivescript triggers to be loaded into the Rivescript bot upon app start.
 *
 * TODO: Iterate through all pages of results instead of only returning first page results.
 * @see https://github.com/DoSomething/gambit-conversations/issues/197
 *
 * @return {Promise}
 */
function fetchAllDefaultTopicTriggers() {
  return gambitCampaigns.fetchDefaultTopicTriggers()
    .then(defaultTopicTriggers => defaultTopicTriggers.map(module.exports
      .parseDefaultTopicTrigger));
}

/**
 * @return {Promise}
 */
function fetchAllTopics() {
  return gambitCampaigns.fetchTopics();
}

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
 * @param {Object} topic
 * @param {String} templateName
 */
function getRenderedTextFromTopicAndTemplateName(topic, templateName) {
  return topic.templates[templateName].rendered;
}

/**
 * Parses a defaultTopicTrigger to set macro reply for topic changes.
 *
 * @param {Object} defaultTopicTrigger
 * @return {String}
 */
function parseDefaultTopicTrigger(defaultTopicTrigger) {
  if (!defaultTopicTrigger) {
    return null;
  }
  const data = Object.assign({}, defaultTopicTrigger);
  if (data.topicId) {
    data.reply = helpers.macro.getChangeTopicMacroFromTopicId(data.topicId);
  }
  return data;
}

module.exports = {
  fetchAllDefaultTopicTriggers,
  fetchAllTopics,
  fetchById,
  fetchByCampaignId,
  getRenderedTextFromTopicAndTemplateName,
  parseDefaultTopicTrigger,
};
