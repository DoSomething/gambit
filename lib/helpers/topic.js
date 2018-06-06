'use strict';

const gambitCampaigns = require('../gambit-campaigns');

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
    // TODO: Add macro helper functions to get the macro name to output, as well as code to execute.
    data.reply = `changeTopicTo${data.topicId}`;
  }
  return data;
}

module.exports = {
  fetchAllDefaultTopicTriggers,
  parseDefaultTopicTrigger,
};