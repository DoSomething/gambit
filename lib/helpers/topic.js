'use strict';

const helpers = require('../helpers');
const chatbotContent = require('../gambit-campaigns');
const logger = require('../logger');

/**
 * Queries Contentful API for first page of defaultTopicTrigger entries and returns as an array of
 * Rivescript triggers to be loaded into the Rivescript bot upon app start.
 *
 * TODO: Iterate through all pages of results instead of only returning first page results.
 * @see https://github.com/DoSomething/gambit-conversations/issues/197
 *
 * @return {Promise}
 */
function fetchAllDefaultTopicTriggers() {
  return chatbotContent.fetchAllDefaultTopicTriggers()
    .then(defaultTopicTriggers => defaultTopicTriggers.map(module.exports
      .parseDefaultTopicTrigger));
}

/**
 * @param {String} topicId
 * @return {Promise}
 */
function fetchById(topicId) {
  logger.debug('topic.fetchById', { topicId });
  return chatbotContent.fetchTopicById(topicId);
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
  const data = defaultTopicTrigger;
  if (!data) {
    return null;
  }
  if (data.topicId) {
    data.reply = helpers.macro.getChangeTopicMacroFromTopicId(data.topicId);
  }
  return data;
}

module.exports = {
  fetchAllDefaultTopicTriggers,
  fetchById,
  getRenderedTextFromTopicAndTemplateName,
  parseDefaultTopicTrigger,
};
