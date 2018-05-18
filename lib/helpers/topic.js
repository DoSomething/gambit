'use strict';

const helpers = require('../helpers');
const contentful = require('../contentful');
const logger = require('../logger');

const contentTypes = ['externalPostConfig', 'textPostConfig'];

/**
 * @return {Promise}
 */
function fetchAllTopics() {
  return contentful.fetchEntriesWithContentTypes(contentTypes)
    .then((contentfulEntries) => {
      logger.info('fetchAllTopics', { count: contentfulEntries.length });
      return Promise.all(contentfulEntries.map(contentfulEntry => module.exports
        .parseTopicFromContentfulEntry(contentfulEntry)));
    });
}

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
function getById(topicId) {
  return helpers.cache.topics.get(topicId)
    .then((data) => {
      if (data) {
        logger.debug('Topic cache hit', { topicId });
        return Promise.resolve(data);
      }
      logger.debug('Topic cache miss', { topicId });
      return contentful.fetchEntryById(topicId)
        .then(contentfulEntry => module.exports.parseTopicFromContentfulEntry(contentfulEntry));
    });
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

  if (contentful.isDefaultTopicTrigger(responseEntry)) {
    data.redirect = contentful.getTriggerTextFromDefaultTopicTrigger(responseEntry);
    return data;
  }

  if (contentful.isMessage(responseEntry)) {
    data.reply = contentful.getTextFromMessage(responseEntry);
    return data;
  }

  const topicId = contentful.parseEntryIdFromContentfulEntry(responseEntry);
  data.reply = helpers.macro.getChangeTopicMacroFromTopicId(topicId);
  return data;
}

/**
 * @param {Object} contentfulEntry
 * @return {Promise}
 */
function parseTopicFromContentfulEntry(contentfulEntry) {
  const id = contentful.parseEntryIdFromContentfulEntry(contentfulEntry);
  const campaignId = contentful.getCampaignIdFromBroadcast(contentfulEntry);
  const data = {
    id,
    type: contentful.parseContentTypeFromContentfulEntry(contentfulEntry),
    campaignId,
  };
  logger.debug('parseTopicFromContentfulEntry', { data });

  return helpers.cache.topics.set(id, data);
}

module.exports = {
  fetchAllDefaultTopicTriggers,
  fetchAllTopics,
  getById,
  parseDefaultTopicTriggerFromContentfulEntry,
  parseTopicFromContentfulEntry,
};
