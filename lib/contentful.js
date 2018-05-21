'use strict';

/**
 * Imports.
 */
const contentful = require('contentful');
const Promise = require('bluebird');
const logger = require('heroku-logger');
const underscore = require('underscore');
const NotFoundError = require('../app/exceptions/NotFoundError');

const config = require('../config/lib/contentful');
const Builder = require('./contentfulQueryBuilder');

const ERROR_PREFIX = 'Contentful:';

/**
 * Gets an instance of the contentful query builder
 *
 * @return {QueryBuilder}
 */
function getQueryBuilder() {
  return new Builder();
}

/**
 * Setup.
 */
let client;

/**
 * createNewClient
 *
 * @return {Object}  client - Contentful client
 */
function createNewClient() {
  try {
    client = contentful.createClient(config.clientOptions);
  } catch (err) {
    logger.error(module.exports.contentfulError(err));
  }
  return client;
}

/**
 * getClient - creates and returns a new client if one has not been created.
 *
 * @return {Object}  client
 */
function getClient() {
  if (!client) {
    return createNewClient();
  }
  return client;
}

/**
 * Prefixes Contentful identifier to given error.message.
 */
function contentfulError(error) {
  const scope = error;
  scope.message = `${ERROR_PREFIX} ${error.message}`;
  return scope;
}

/**
 * Returns first result of a Contentful getEntries call for the given contentfulId.
 * @param {string} contentfulId
 * @return {Promise}
 */
function fetchByContentfulId(contentfulId) {
  const query = module.exports.getQueryBuilder()
    .contentfulId(contentfulId)
    .build();

  return new Promise((resolve, reject) => {
    logger.debug('fetchByContentfulId', { contentfulId });
    return module.exports.getClient().getEntries(query)
      .then((entries) => {
        const entry = underscore.first(entries.items);
        if (!entry) {
          const queryStr = JSON.stringify(query);
          const error = new NotFoundError(`${ERROR_PREFIX} Entry not found for query ${queryStr}`);
          return reject(error);
        }
        return resolve(entry);
      })
      .catch(error => reject(module.exports.contentfulError(error)));
  });
}

function getEntries(query) {
  return new Promise((resolve, reject) => {
    logger.debug(`contentful.getEntries:${JSON.stringify(query)}`);
    return module.exports.getClient().getEntries(query)
      .then((res) => {
        logger.debug('contentful.getEntries success', { total: res.total });
        return resolve(res.items);
      })
      .catch(error => reject(module.exports.contentfulError(error)));
  });
}

/**
 * TODO: Support query params to page through results.
 * @return {Promise}
 */
function fetchBroadcasts() {
  const query = module.exports.getQueryBuilder()
    .contentType('broadcast')
    // The message field wasn't required pre-Conversations, filter all pre-TGM broadcast entries.
    .custom({
      'fields.message[exists]': true,
      order: '-sys.createdAt',
    })
    .build();
  return module.exports.getEntries(query);
}

/**
 * TODO: Return all pages of results, this only returns first page.
 * @return {Promise}
 */
function fetchDefaultTopicTriggers() {
  const query = module.exports.getQueryBuilder()
    .contentType('defaultTopicTrigger')
    .build();
  return module.exports.getEntries(query);
}

/**
 * @param {object} contentfulEntry
 * @return {string}
 */
function getCampaignIdFromCampaignReferenceOnContentfulEntry(contentfulEntry) {
  const campaign = contentfulEntry.fields.campaign;
  if (campaign && campaign.fields) {
    return campaign.fields.campaignId;
  }
  return null;
}

/**
 * @param {object} broadcastObject
 * @return {object}
 */
function getAttachmentsFromBroadcast(broadcastObject) {
  const attachmentsFieldValue = broadcastObject.fields.attachments;
  if (!attachmentsFieldValue) {
    return [];
  }
  return attachmentsFieldValue.map(assetObject => assetObject.fields.file);
}

/**
 * @param {object} broadcastObject
 * @return {string}
 */
function getTopicFromBroadcast(broadcastObject) {
  return broadcastObject.fields.topic;
}

/**
 * @param {object} broadcastObject
 * @return {string}
 */
function getMessageTextFromBroadcast(broadcastObject) {
  return broadcastObject.fields.message;
}

/**
 * @param {object} broadcastObject
 * @return {string}
 */
function getMessageTemplateFromBroadcast(broadcastObject) {
  return broadcastObject.fields.template;
}

/**
 * @param {Object} defaultTopicTriggerObject
 * @return {Object} - Contentful entry saved to the response reference field
 */
function getResponseEntryFromDefaultTopicTrigger(defaultTopicTriggerObject) {
  return defaultTopicTriggerObject.fields.response;
}

/**
 * @param {Object} defaultTopicTriggerObject - A defaultTopicTrigger Contentful entry
 * @return {String}
 */
function getTriggerTextFromDefaultTopicTrigger(defaultTopicTriggerObject) {
  return defaultTopicTriggerObject.fields.trigger;
}

/**
 * @param {Object} messageObject - A message Contentful entry
 * @return {String}
 */
function getTextFromMessage(messageObject) {
  return messageObject.fields.text;
}

/**
 * @param {Object} contentfulEntry
 * @return {String}
 */
function getContentfulIdFromContentfulEntry(contentfulEntry) {
  return contentfulEntry.sys.id;
}

/**
 * @param {Object} contentfulEntry
 * @return {String}
 */
function getContentTypeFromContentfulEntry(contentfulEntry) {
  return contentfulEntry.sys.contentType.sys.id;
}

/**
 * @param {Object} contentfulEntry
 * @param {String} contentTypeName
 * @return {Boolean}
 */
function isContentType(contentfulEntry, contentTypeName) {
  const contentType = module.exports.getContentTypeFromContentfulEntry(contentfulEntry);
  return contentType === contentTypeName;
}

/**
 * @param {Object} contentfulEntry
 * @return {Boolean}
 */
function isDefaultTopicTrigger(contentfulEntry) {
  return module.exports.isContentType(contentfulEntry, 'defaultTopicTrigger');
}

/**
 * @param {Object} contentfulEntry
 * @return {Boolean}
 */
function isMessage(contentfulEntry) {
  return module.exports.isContentType(contentfulEntry, 'message');
}

module.exports = {
  contentfulError,
  fetchBroadcasts,
  fetchDefaultTopicTriggers,
  fetchByContentfulId,
  getAttachmentsFromBroadcast,
  getCampaignIdFromCampaignReferenceOnContentfulEntry,
  getClient,
  getContentfulIdFromContentfulEntry,
  getContentTypeFromContentfulEntry,
  getEntries,
  getMessageTemplateFromBroadcast,
  getMessageTextFromBroadcast,
  getTopicFromBroadcast,
  getQueryBuilder,
  getTextFromMessage,
  getResponseEntryFromDefaultTopicTrigger,
  getTriggerTextFromDefaultTopicTrigger,
  isContentType,
  isDefaultTopicTrigger,
  isMessage,
};
