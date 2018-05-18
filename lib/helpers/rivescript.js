'use strict';

const config = require('../../config/lib/helpers/rivescript');

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
 * @param {String} triggerText
 * @return {Array}
 */
function getRivescriptFromTriggerTextAndRivescriptLine(triggerText, rivescriptLine) {
  const lines = [module.exports.formatRivescriptLine(config.commands.trigger, triggerText)];
  lines.push(rivescriptLine);
  return module.exports.joinRivescriptLines(lines);
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
 * @param {Array} defaultTopicTriggers
 * @return {String}
 */
function getRivescriptFromDefaultTopicTriggers(defaultTopicTriggers) {
  const result = defaultTopicTriggers.map((data) => {
    if (data.redirect) {
      return module.exports.getRedirectRivescript(data.trigger, data.redirect);
    }
    return module.exports.getReplyRivescript(data.trigger, data.reply);
  });
  return module.exports.joinRivescriptLines(result);
}

/**
 * @param {Array} lines
 * @return {String}
 */
function joinRivescriptLines(lines) {
  return lines.join(config.separators.line);
}

/**
 * Returns Rivescript defining a topic with the topic.id.
 * This is how we'll handle topic specific triggers within in Contentful, by linking topic name
 * with the corresponding Contentful entry id.
 *
 * @param {Object} topic
 * @return {Object}
 */
function getRivescriptFromTopic(topic) {
  const lines = [];
  // The campaign topic is defined in brain/topics.rive
  const topicDefinition = `topic ${topic.id} includes campaign`;
  lines.push(module.exports.formatRivescriptLine('>', topicDefinition));
  lines.push(module.exports.getReplyRivescript('[*]', 'gambit'));
  lines.push(module.exports.formatRivescriptLine('<', 'topic'));
  return module.exports.joinRivescriptLines(lines);
}

function getRivescriptFromTopics(topics) {
  const topicRivescripts = topics.map(topic => getRivescriptFromTopic(topic));
  return module.exports.joinRivescriptLines(topicRivescripts);
}

module.exports = {
  formatRivescriptLine,
  getRedirectRivescript,
  getReplyRivescript,
  getRivescriptFromDefaultTopicTriggers,
  getRivescriptFromTopic,
  getRivescriptFromTopics,
  getRivescriptFromTriggerTextAndRivescriptLine,
  joinRivescriptLines,
};
