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
  if (defaultTopicTrigger.redirect) {
    return module.exports
      .getRedirectRivescript(defaultTopicTrigger.trigger, defaultTopicTrigger.redirect);
  }

  return module.exports
    .getReplyRivescript(defaultTopicTrigger.trigger, defaultTopicTrigger.reply);
}

/**
 * Returns Rivescript defining a topic with the given topic id.
 * Eventually we may add handle topic-specific triggers here once available via Content API.
 *
 * @param {String} topicId
 * @return {String}
 */
function getRivescriptMenuTopicForTopicId(topicId) {
  // The menu topic is defined in brain/topics.rive
  const topicDefinition = `topic ${topicId} includes menu`;
  return module.exports.joinRivescriptLines([
    module.exports.formatRivescriptLine('>', topicDefinition),
    // TODO: catchAll macro value should be set in config.
    // @see brain/star.rive
    module.exports.getReplyRivescript('[*]', 'catchAll'),
    module.exports.formatRivescriptLine('<', 'topic'),
  ]);
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
  return helpers.topic.fetchAllDefaultTopicTriggers()
    .then((defaultTopicTriggers) => {
      logger.info('fetchAllDefaultTopicTriggers success', { count: defaultTopicTriggers.length });
      const topics = {};
      const triggers = [];
      defaultTopicTriggers.forEach((defaultTopicTrigger) => {
        triggers.push(module.exports.getRivescriptFromDefaultTopicTrigger(defaultTopicTrigger));
        if (defaultTopicTrigger.reply && defaultTopicTrigger.reply.startsWith('changeTopic')) {
          const topicId = defaultTopicTrigger.topic.id;
          if (!topics[topicId]) {
            topics[topicId] = module.exports.getRivescriptMenuTopicForTopicId(topicId);
          }
        }
      });
      const data = module.exports.joinRivescriptLines(triggers.concat(Object.values(topics)));
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
  getRivescriptFromTriggerTextAndRivescriptLine,
  getRivescriptMenuTopicForTopicId,
  joinRivescriptLines,
  writeRivescript,
};
