'use strict';

const helpers = require('../helpers');
const logger = require('../logger');
const gambitCampaigns = require('../gambit-campaigns');
const rivescript = require('../rivescript');
const config = require('../../config/lib/helpers/rivescript');

const cacheKey = config.cacheKey;

/**
 * @param {Boolean} resetCache
 * @return {Promise}
 */
async function getDeparsedRivescript(resetCache = false) {
  if (!rivescript.isReady() || resetCache === true) {
    await module.exports.loadBot(resetCache);
  }
  // @see https://github.com/aichaos/rivescript-js/blob/master/docs/rivescript.md#data-deparse
  return rivescript.getBot().deparse();
}

/**
 * @param {Boolean} resetCache
 * @return {Promise}
 */
async function getRivescripts(resetCache = false) {
  logger.debug('getRivescripts');
  if (resetCache === true) {
    logger.debug('rivescript cache clear');
    return module.exports.fetchRivescripts();
  }
  const cache = await helpers.cache.rivescript.get(cacheKey);
  if (cache) {
    logger.debug('rivescript cache hit');
    return cache;
  }
  logger.debug('rivescript cache miss');
  return module.exports.fetchRivescripts();
}

/**
 * @return {Promise}
 */
function fetchRivescripts() {
  return gambitCampaigns.fetchDefaultTopicTriggers()
    // TODO: Check our res.meta to determine whether to fetch more triggers.
    .then((res) => {
      logger.debug('fetchDefaultTopicTriggers success', { count: res.data.length });
      return res.data.map(module.exports.parseRivescript);
    })
    .then(rivescripts => helpers.cache.rivescript.set(cacheKey, rivescripts));
}

/**
 * Modifies the reply property if given defaultTopicTrigger is a changeTopic macro.
 *
 * @param {Object} defaultTopicTrigger
 * @return {Object}
 */
function parseRivescript(defaultTopicTrigger) {
  if (!defaultTopicTrigger) {
    throw new Error('parseRivescript cannot parse falsy defaultTopicTrigger');
  }
  const data = Object.assign({}, defaultTopicTrigger);
  if (data.topic && data.topic.id) {
    data.reply = helpers.macro.getChangeTopicMacroFromTopicId(data.topic.id);
  }
  return module.exports.getRivescriptFromDefaultTopicTrigger(data);
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
 * @param {Boolean} resetCache
 * @return {Promise}
 */
function loadBot(resetCache = false) {
  return module.exports.getRivescripts(resetCache)
    .then(rivescripts => rivescript.loadBotWithRivescripts(rivescripts));
}

/**
 * @param {String} userId
 * @param {String} topicId
 * @param {String} messageText
 * @return {Promise}
 */
async function getBotReply(userId, topicId, messageText) {
  if (!rivescript.isReady()) {
    await module.exports.loadBot();
  } else {
    const cache = await helpers.cache.rivescript.get(cacheKey);
    if (!cache) {
      await module.exports.loadBot();
    }
  }

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
  fetchRivescripts,
  formatRivescriptLine,
  getBotReply,
  getDeparsedRivescript,
  getRedirectRivescript,
  getReplyRivescript,
  getRivescriptFromDefaultTopicTrigger,
  getRivescriptFromTriggerTextAndRivescriptLine,
  getRivescripts,
  joinRivescriptLines,
  loadBot,
  parseAskYesNoResponse,
  parseRivescript,
};
