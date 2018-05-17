'use strict';

const helpers = require('../helpers');
const contentful = require('../contentful');
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
function fetchDefaultTopicTriggers() {
  return contentful.fetchDefaultTopicTriggers()
    .then(contentfulEntries => contentfulEntries.map(contentfulEntry => module.exports
      .parseDefaultTopicTriggerFromContentfulEntry(contentfulEntry)));
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
function getMacroNameFromContentfulEntry(contentfulEntry) {
  const prefix = helpers.macro.getChangeTopicMacroPrefix();
  const topicId = contentful.parseEntryIdFromContentfulEntry(contentfulEntry);
  return `${prefix}${topicId}`;
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
 * @param {String} text
 * @return {String}
 */
function getTriggerCommandFromText(text) {
  return module.exports.formatRivescriptLine(config.commands.trigger, text);
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

  const macroName = module.exports.getMacroNameFromContentfulEntry(responseContentfulEntry);
  return module.exports.getResponseCommandFromText(macroName);
}

/**
 * Parses a defaultTopicTrigger Contentful entry to return a trigger on default Rivescript topic.
 *
 * @param {Object} contentfulEntry
 * @return {String}
 */
function parseDefaultTopicTriggerFromContentfulEntry(contentfulEntry) {
  const lines = [];
  const triggerText = contentful.getTriggerFromDefaultTopicTrigger(contentfulEntry);
  lines.push(module.exports.getTriggerCommandFromText(triggerText));
  lines.push(module.exports.getResponseFromDefaultTopicTrigger(contentfulEntry));
  const result = lines.join(config.separators.line);
  return result;
}

/**
 * Parses a topic object to return a string to define a topic in Rivescript.
 *
 * @param {Object} topic
 * @return {Object}
 */
function formatRivescriptTopic(topic) {
  const lines = [];
  // The campaign topic is defined in brain/topics.rive
  const topicDefinition = `topic ${topic.id} includes campaign`;
  lines.push(module.exports.formatRivescriptLine('>', topicDefinition));
  lines.push(module.exports.getTriggerCommandFromText('[*]'));
  lines.push(module.exports.getResponseCommandFromText('gambit'));
  lines.push(module.exports.formatRivescriptLine('>', 'topic'));
  const result = lines.join(config.separators.line);
  return result;
}

module.exports = {
  fetchDefaultTopicTriggers,
  formatRivescriptLine,
  formatRivescriptTopic,
  getMacroNameFromContentfulEntry,
  getRedirectCommandFromText,
  getResponseCommandFromText,
  getTriggerCommandFromText,
  getResponseFromDefaultTopicTrigger,
  parseDefaultTopicTriggerFromContentfulEntry,
};
