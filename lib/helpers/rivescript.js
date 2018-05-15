'use strict';

const contentful = require('../contentful');
const logger = require('../logger');
const config = require('../../config/lib/helpers/rivescript');

/**
 * Queries Contentful API for first page of defaultTopicTrigger entries and returns as an array of
 * Rivescript triggers to be loaded into the Rivescript bot upon app start.
 *
 * TODO: Iterate through all pages of results instead of only returning first page results.
 * @see https://github.com/DoSomething/gambit-conversations/issues/197
 *
 * @return {Promise}
 */
function fetchRivescript() {
  return contentful.fetchDefaultTopicTriggers()
    .then(contentfulEntries => contentfulEntries.map(contentfulEntry => module.exports
      .parseDefaultTopicTrigger(contentfulEntry)));
}

/**
 *  Returns a string to be used as a line of Rivescript.
 *
 * @param {String} operator
 * @param {String} value
 * @return {String}
 */
function formatRivescriptLine(operator, value) {
  const trimmedValue = value.trim();
  const rivescriptText = `${operator}${config.separators.command}${trimmedValue}`;
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
 * @param {Object} defaultTopicTrigger
 * @return {String}
 */
function getResponseFromDefaultTopicTrigger(defaultTopicTrigger) {
  const responseContentfulEntry = contentful
    .getResponseFromDefaultTopicTrigger(defaultTopicTrigger);

  if (contentful.isDefaultTopicTrigger(responseContentfulEntry)) {
    const triggerText = contentful
      .getTriggerFromDefaultTopicTrigger(responseContentfulEntry);
    return module.exports.getRedirectCommandFromText(triggerText);
  }

  if (contentful.isMessage(responseContentfulEntry)) {
    const messageText = contentful.getTextFromMessage(responseContentfulEntry);
    return module.exports.getResponseCommandFromText(messageText);
  }

  throw new Error('Invalid content type for defaultTopicTrigger.response');
}

/**
 * @param {Object} defaultTopicTrigger
 * @return {String}
 */
function getTriggerFromDefaultTopicTrigger(defaultTopicTrigger) {
  const triggerText = contentful
    .getTriggerFromDefaultTopicTrigger(defaultTopicTrigger);
  return module.exports.formatRivescriptLine(config.commands.trigger, triggerText);
}

/**
 * Parses given defaultTopicTrigger Contentful entry to return a string of Rivescript,
 * defining a new user command and the bot response.
 *
 * @param {Object} defaultTopicTrigger
 * @return {String}
 */
function parseDefaultTopicTrigger(defaultTopicTrigger) {
  const rsTriggerLine = module.exports
    .getTriggerFromDefaultTopicTrigger(defaultTopicTrigger);
  const rsResponseLine = module.exports
    .getResponseFromDefaultTopicTrigger(defaultTopicTrigger);
  const result = `${rsTriggerLine}${rsResponseLine}`;
  logger.debug('parseDefaultTopicTrigger', { result });
  return result;
}

module.exports = {
  fetchRivescript,
  formatRivescriptLine,
  getRedirectCommandFromText,
  getResponseCommandFromText,
  getTriggerFromDefaultTopicTrigger,
  getResponseFromDefaultTopicTrigger,
  parseDefaultTopicTrigger,
};
