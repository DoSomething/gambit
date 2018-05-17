'use strict';

const helpers = require('../helpers');
const contentful = require('../contentful');
const logger = require('../logger');

/**
 * @return {Promise}
 */
function fetchAllTopics() {
  // TODO: Define content types in configs.
  return contentful.fetchEntriesWithContentTypes(['textPostConfig'])
    .then((contentfulEntries) => {
      logger.debug('fetchEntriesWithContentTypes', { count: contentfulEntries.length });
      return Promise.all(contentfulEntries.map(contentfulEntry => module.exports
        .parseTopicFromContentfulEntry(contentfulEntry)));
    });
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
  fetchAllTopics,
  getById,
  parseTopicFromContentfulEntry,
};
