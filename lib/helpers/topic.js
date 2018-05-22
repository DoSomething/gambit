'use strict';

const helpers = require('../helpers');
const chatbotContent = require('../gambit-campaigns');
const contentful = require('../contentful');
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
  return contentful.fetchDefaultTopicTriggers()
    .then(contentfulEntries => contentfulEntries.map(contentfulEntry => module.exports
      .parseDefaultTopicTriggerFromContentfulEntry(contentfulEntry)));
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
 * Parses a defaultTopicTrigger Contentful entry as data for writing Rivescript to define
 * triggers on the default topic.
 *
 * @param {Object} contentfulEntry - defaultTopicTrigger
 * @return {String}
 */
function parseDefaultTopicTriggerFromContentfulEntry(contentfulEntry) {
  const data = {
    trigger: contentful.getTriggerTextFromDefaultTopicTrigger(contentfulEntry),
  };

  const responseEntry = contentful.getResponseEntryFromDefaultTopicTrigger(contentfulEntry);
  if (!responseEntry) {
    return null;
  }

  if (contentful.isDefaultTopicTrigger(responseEntry)) {
    data.redirect = contentful.getTriggerTextFromDefaultTopicTrigger(responseEntry);
    return data;
  }

  if (contentful.isMessage(responseEntry)) {
    data.reply = contentful.getTextFromMessage(responseEntry);
    return data;
  }

  const topicId = contentful.getContentfulIdFromContentfulEntry(responseEntry);
  data.reply = helpers.macro.getChangeTopicMacroFromTopicId(topicId);
  return data;
}

module.exports = {
  fetchAllDefaultTopicTriggers,
  fetchById,
  getRenderedTextFromTopicAndTemplateName,
  parseDefaultTopicTriggerFromContentfulEntry,
};
