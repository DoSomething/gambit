'use strict';

const contentful = require('../contentful');
const logger = require('../logger');
const config = require('../../config/lib/helpers/rivescript');

function fetchDefaultRivescriptTopicTriggers() {
  return new Promise((resolve, reject) => {
    // TODO: fetch all rivescriptTopic entries to add any additional topics
    contentful.fetchDefaultRivescriptTopicTriggers()
      .then((triggers) => {
        const result = triggers.map((trigger) => {
          const rivescriptTrigger = module.exports.parseDefaultRivescriptTopicTrigger(trigger);
          return rivescriptTrigger;
        });
        return resolve(result);
      })
      .catch(err => reject(err));
  });
}

function parseDefaultRivescriptTopicTriggerResponse(contentfulEntry) {
  if (contentful.isDefaultRivescriptTopicTrigger(contentfulEntry)) {
    const triggerText = contentful.getTriggerFromDefaultRivescriptTopicTrigger(contentfulEntry);
    return module.exports.getRedirectCommandFromText(triggerText);
  }

  if (contentful.isMessage(contentfulEntry)) {
    const messageText = contentful.getTextFromMessage(contentfulEntry);
    return module.exports.getResponseCommandFromText(messageText);
  }

  throw new Error('Invalid content type for defaultRivescriptTopicTrigger.response');
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
 * @param {String} text
 * @return {String}
 */
function getTriggerCommandFromText(text) {
  return module.exports.formatRivescriptLine(config.commands.trigger, text);
}

/**
 * Parses given defaultRivescriptTopicTrigger Contentful entry to return a string of Rivescript,
 * defining a new user command and the bot response.
 *
 * @param {Object} contentfulEntry
 * @return {String}
 */
function parseDefaultRivescriptTopicTrigger(contentfulEntry) {
  const triggerText = contentful.getTriggerFromDefaultRivescriptTopicTrigger(contentfulEntry);
  const rsTriggerLine = module.exports.getTriggerCommandFromText(triggerText);

  const responseEntry = contentful.getResponseFromDefaultRivescriptTopicTrigger(contentfulEntry);
  const rsResponseLine = module.exports.parseDefaultRivescriptTopicTriggerResponse(responseEntry);

  const result = `${rsTriggerLine}${rsResponseLine}`;
  logger.debug('parseDefaultRivescriptTopicTrigger', { result });
  return result;
}

module.exports = {
  formatRivescriptLine,
  getRedirectCommandFromText,
  getResponseCommandFromText,
  getTriggerCommandFromText,
  fetchDefaultRivescriptTopicTriggers,
  parseDefaultRivescriptTopicTrigger,
  parseDefaultRivescriptTopicTriggerResponse,
};
