'use strict';

const helpers = require('../helpers');
const gambitCampaigns = require('../gambit-campaigns');
const rivescript = require('../rivescript');
const config = require('../../config/lib/helpers/rivescript');

/**
 * @param {Object} query
 * @return {Promise}
 */
function fetchDefaultTopicTriggers(query = {}) {
  return gambitCampaigns.fetchDefaultTopicTriggers(query)
    // TODO: Set Rivescript cache
    .then(res => res.data.map(module.exports.parseDefaultTopicTrigger));
}

/**
 * Modifies the reply property if given defaultTopicTrigger is a changeTopic macro.
 *
 * @param {Object} defaultTopicTrigger
 * @return {Object}
 */
function parseDefaultTopicTrigger(defaultTopicTrigger) {
  if (!defaultTopicTrigger) {
    throw new Error('parseDefaultTopicTrigger cannot parse falsy defaultTopicTrigger');
  }
  const data = Object.assign({}, defaultTopicTrigger);
  if (data.topic && data.topic.id) {
    data.reply = helpers.macro.getChangeTopicMacroFromTopicId(data.topic.id);
  }
  return data;
}

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
 * @param {Array} lines
 * @return {String}
 */
function joinRivescriptLines(lines) {
  return lines.join(config.separators.line);
}

/**
 * @return {Promise}
 */
function loadBot() {
  // TODO: We may eventually add enough defaultTopicTrigger entries that we need to execute multiple
  // GET requests fo fetch all content required for our default topic.
  return module.exports.fetchDefaultTopicTriggers()
    .then(data => rivescript
      .createNewBot(data.map(module.exports.getRivescriptFromDefaultTopicTrigger)));
}

/**
 * @param {String} userId
 * @param {String} topicId
 * @param {String} messageText
 * @return {Promise}
 */
function getBotReply(userId, topicId, messageText) {
  // TODO: Check if Rivescript cache is set. If it isn't, we need to reload the bot.
  // If Rivescript bot receives a message in a topic that it doesn't know about, it logs a
  // "User x was in an empty topic Y" message to the console. This avoids that message.
  const rivescriptTopicId = helpers.topic
    .isRivescriptTopicId(topicId) ? topicId : helpers.topic.getDefaultTopicId();
  return rivescript.getBotReply(userId, rivescriptTopicId, messageText);
}

/**
 * @param {String} messageText
 * @return {Promise}
 */
function parseAskYesNoResponse(messageText) {
  return rivescript.getBotReply('global', 'ask_yes_no', messageText).then(res => res.text);
}

module.exports = {
  getBotReply,
  fetchDefaultTopicTriggers,
  formatRivescriptLine,
  getRedirectRivescript,
  getReplyRivescript,
  getRivescriptFromDefaultTopicTrigger,
  getRivescriptFromTriggerTextAndRivescriptLine,
  joinRivescriptLines,
  loadBot,
  parseAskYesNoResponse,
  parseDefaultTopicTrigger,
};
