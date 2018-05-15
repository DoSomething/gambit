'use strict';

const contentful = require('../contentful');
const logger = require('../logger');
const config = require('../../config/lib/helpers/rivescript');

/**
 * Queries Contentful API for first page defaultRivescriptTopic entries and returns as an array of
 * Rivescript triggers to be loaded into our Rivescript bot upon app start.
 *
 * TODO: Iterate through all pages in defaultRivescriptTopicResults instead of first page returned.
 * @see https://github.com/DoSomething/gambit-conversations/issues/197
 * TODO: Add new rivescriptTopic content type and page through it for any non-default topics.
 *
 * @return {Promise}
 */
function fetchRivescript() {
  return contentful.fetchDefaultRivescriptTopicTriggers()
    .then(contentfulEntries => contentfulEntries.map(contentfulEntry => module.exports
      .parseDefaultRivescriptTopicTrigger(contentfulEntry)));
}

/**
 *  Returns a string to be used as a line of Rivescript.
 *
 * @param {String} operator
 * @param {String} value
 * @return {String}
 */
function formatRivescriptLine(operator, value) {
  const rivescriptText = `${operator}${config.separators.command}${value}`.trim();
  return `${rivescriptText}${config.separators.line}`;
}

/**
 * @param {String} text
 * @return {String}
 */
function getRedirectCommandFromText(text) {
  return module.exports.formatRivescriptLine(config.commands.redirect, text);
}

/**
 * @param {String} text
 * @return {String}
 */
function getResponseCommandFromText(text) {
  return module.exports.formatRivescriptLine(config.commands.response, text);
}

/**
 * @param {Object} defaultRivescriptTopicTrigger
 * @return {String}
 */
function getResponseFromDefaultRivescriptTopicTrigger(defaultRivescriptTopicTrigger) {
  const responseContentfulEntry = contentful
    .getResponseFromDefaultRivescriptTopicTrigger(defaultRivescriptTopicTrigger);

  if (contentful.isDefaultRivescriptTopicTrigger(responseContentfulEntry)) {
    const triggerText = contentful
      .getTriggerFromDefaultRivescriptTopicTrigger(responseContentfulEntry);
    return module.exports.getRedirectCommandFromText(triggerText);
  }

  if (contentful.isMessage(responseContentfulEntry)) {
    const messageText = contentful.getTextFromMessage(responseContentfulEntry);
    return module.exports.getResponseCommandFromText(messageText);
  }

  throw new Error('Invalid content type for defaultRivescriptTopicTrigger.response');
}

/**
 * @param {Object} defaultRivescriptTopicTrigger
 * @return {String}
 */
function getTriggerFromDefaultRivescriptTopicTrigger(defaultRivescriptTopicTrigger) {
  const triggerText = contentful
    .getTriggerFromDefaultRivescriptTopicTrigger(defaultRivescriptTopicTrigger);
  return module.exports.formatRivescriptLine(config.commands.trigger, triggerText);
}

/**
 * Parses given defaultRivescriptTopicTrigger Contentful entry to return a string of Rivescript,
 * defining a new user command and the bot response.
 *
 * @param {Object} defaultRivescriptTopicTrigger
 * @return {String}
 */
function parseDefaultRivescriptTopicTrigger(defaultRivescriptTopicTrigger) {
  const rsTriggerLine = module.exports
    .getTriggerFromDefaultRivescriptTopicTrigger(defaultRivescriptTopicTrigger);
  const rsResponseLine = module.exports
    .getResponseFromDefaultRivescriptTopicTrigger(defaultRivescriptTopicTrigger);
  const result = `${rsTriggerLine}${rsResponseLine}`;
  logger.debug('parseDefaultRivescriptTopicTrigger', { result });
  return result;
}

module.exports = {
  fetchRivescript,
  formatRivescriptLine,
  getRedirectCommandFromText,
  getResponseCommandFromText,
  getTriggerFromDefaultRivescriptTopicTrigger,
  getResponseFromDefaultRivescriptTopicTrigger,
  parseDefaultRivescriptTopicTrigger,
};
