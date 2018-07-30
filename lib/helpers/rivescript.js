'use strict';

const helpers = require('../helpers');
const logger = require('../logger');
const gambitCampaigns = require('../gambit-campaigns');
const config = require('../../config/lib/helpers/rivescript');

/**
 * @param {Object} query
 * @return {Promise}
 */
function fetchDefaultTopicTriggers(query = {}) {
  return gambitCampaigns.fetchDefaultTopicTriggers(query)
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
 * @param {Array} lines
 * @return {String}
 */
function joinRivescriptLines(lines) {
  return lines.join(config.separators.line);
}

/**
 * @return {Promise}
 */
function fetchRivescript() {
  // TODO: We may eventually add enough defaultTopicTrigger entries that we need to execute multiple
  // GET requests fo fetch all content required for our default topic.
  return module.exports.fetchDefaultTopicTriggers()
    .then((defaultTopicTriggers) => {
      logger.info('fetchAllDefaultTopicTriggers success', { count: defaultTopicTriggers.length });
      const result = defaultTopicTriggers.map(module.exports.getRivescriptFromDefaultTopicTrigger);
      return module.exports.joinRivescriptLines(result);
    });
}

module.exports = {
  fetchRivescript,
  fetchDefaultTopicTriggers,
  formatRivescriptLine,
  getRedirectRivescript,
  getReplyRivescript,
  getRivescriptFromDefaultTopicTrigger,
  getRivescriptFromDefaultTopicTriggers,
  getRivescriptFromTriggerTextAndRivescriptLine,
  joinRivescriptLines,
  parseDefaultTopicTrigger,
};
