'use strict';

const fs = require('fs');
const helpers = require('../helpers');
const logger = require('../logger');
const config = require('../../config/lib/helpers/rivescript');
const rivescriptBotConfig = require('../../config/lib/rivescript');

/**
 *  Returns a string to be used as a line of Rivescript.
 *
 * @param {String} operator
 * @param {String} value
 * @return {String}
 */
function formatRivescriptLine(operator, value) {
  if (!value) {
    return null;
  }
  const trimmedValue = value.trim();
  const rivescriptText = `${operator}${config.separators.command}${trimmedValue}`;
  return `${rivescriptText}${config.separators.line}`;
}

/**
 * @param {String} triggerText
 * @return {Array}
 */
function getRivescriptFromTriggerTextAndRivescriptLine(triggerText, rivescriptLine) {
  const triggerLine = module.exports.formatRivescriptLine(config.commands.trigger, triggerText);
  return module.exports.joinRivescriptLines([triggerLine, rivescriptLine]);
}

/**
 * @param {String} triggerText
 * @param {String} redirectText
 * @return {Array}
 */
function getRedirectRivescript(triggerText, redirectText) {
  const redirectLine = module.exports.formatRivescriptLine(config.commands.redirect, redirectText);
  return module.exports.getRivescriptFromTriggerTextAndRivescriptLine(triggerText, redirectLine);
}

/**
 * @param {String} triggerText
 * @param {String} redirectText
 * @return {Array}
 */
function getReplyRivescript(triggerText, replyText) {
  const replyLine = module.exports.formatRivescriptLine(config.commands.reply, replyText);
  return module.exports.getRivescriptFromTriggerTextAndRivescriptLine(triggerText, replyLine);
}

/**
 * Returns given array of objects as a string with Rivescript definitions of triggers on the
 * default topic.
 *
 * @param {Object} defaultTopicTrigger
 * @return {String}
 */
function getRivescriptFromDefaultTopicTrigger(defaultTopicTrigger) {
  if (!defaultTopicTrigger) {
    return null;
  }
  if (defaultTopicTrigger.redirect) {
    return module.exports
      .getRedirectRivescript(defaultTopicTrigger.trigger, defaultTopicTrigger.redirect);
  }
  return module.exports
    .getReplyRivescript(defaultTopicTrigger.trigger, defaultTopicTrigger.reply);
}

/**
 * Returns Rivescript defining a topic with the given topic id.
 * This is how we'll handle topic specific triggers once we add a triggers property to a topic.
 *
 * @param {Object} topic
 * @return {STring}
 */
function getRivescriptFromTopic(topic) {
  const lines = [];
  // The menu topic is defined in brain/topics.rive
  const topicDefinition = `topic ${topic.id} includes menu`;
  lines.push(module.exports.formatRivescriptLine('>', topicDefinition));
  lines.push(module.exports.getReplyRivescript('[*]', 'gambit'));
  lines.push(module.exports.formatRivescriptLine('<', 'topic'));
  return module.exports.joinRivescriptLines(lines);
}

/**
 * @param {Array} topics
 * @return {String}
 */
function getRivescriptFromTopics(topics) {
  const topicRivescripts = topics.map(topic => getRivescriptFromTopic(topic));
  return module.exports.joinRivescriptLines(topicRivescripts);
}

/**
 * Returns given array of defaultTopicTriggers as a string of Rivescript triggers to be defined on
 * the default topic.
 *
 * @param {Object} defaultTopicTriggers
 * @return
 */
function getRivescriptFromDefaultTopicTriggers(defaultTopicTriggers) {
  const rivescripts = defaultTopicTriggers.map(module.exports.getRivescriptFromDefaultTopicTrigger);
  return module.exports.joinRivescriptLines(rivescripts);
}

/**
 * @param {String} data
 * @return {Promise}
 */
function writeRivescript(data) {
  // Note: This file should exist in .gitignore to avoid comitting content changes to the repo.
  const path = `${rivescriptBotConfig.directory}/contentApi.rive`;
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (error) => {
      if (error) return reject(error);
      return resolve({ path });
    });
  });
}

/**
 * @param {Array} lines
 * @return {String}
 */
function joinRivescriptLines(lines) {
  return lines.join(config.separators.line);
}

/**
 * @return {Promise}
 */
function fetchAndWriteRivescript() {
  const fetchRequests = [
    helpers.topic.fetchAllDefaultTopicTriggers(),
    helpers.topic.fetchAllTopics(),
  ];
  return Promise.all(fetchRequests)
    .then((values) => {
      const defaultTopicTriggers = values[0];
      logger.info('defaultTopicTriggers', { count: defaultTopicTriggers.length });
      const topics = values[1];
      logger.info('topics', { count: topics.length });
      const output = [
        module.exports.getRivescriptFromDefaultTopicTriggers(defaultTopicTriggers),
        module.exports.getRivescriptFromTopics(topics),
      ];
      const data = module.exports.joinRivescriptLines(output);
      return module.exports.writeRivescript(data);
    });
}

module.exports = {
  fetchAndWriteRivescript,
  formatRivescriptLine,
  getRedirectRivescript,
  getReplyRivescript,
  getRivescriptFromDefaultTopicTrigger,
  getRivescriptFromDefaultTopicTriggers,
  getRivescriptFromTopic,
  getRivescriptFromTopics,
  getRivescriptFromTriggerTextAndRivescriptLine,
  joinRivescriptLines,
  writeRivescript,
};
