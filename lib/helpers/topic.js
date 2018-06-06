'use strict';

const gambitCampaigns = require('../gambit-campaigns');
const helpers = require('../helpers');

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
 * @param {String} topicId
 * @return {Promise}
 */
function fetchById(topicId) {
  return gambitCampaigns.fetchTopicById(topicId);
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
  fetchById,
  getRenderedTextFromTopicAndTemplateName,
  parseDefaultTopicTrigger,
};
