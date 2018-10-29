'use strict';

const underscore = require('underscore');
const helpers = require('../helpers');
const logger = require('../logger');
const gambitCampaigns = require('../gambit-campaigns');
const rivescript = require('../rivescript');
const config = require('../../config/lib/helpers/rivescript');

const cacheKey = config.cacheKey;

/**
 * @return {Object}
 */
function getDeparsedRivescript() {
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
  return gambitCampaigns.fetchDefaultTopicTriggers({ cache: false, limit: 150 })
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
  return module.exports.getRivescriptFromDefaultTopicTrigger(defaultTopicTrigger);
}

/**
 *  Returns a string to be used as a line of Rivescript.
 *
 * @param {String} operator
 * @param {String} value
 * @return {String}
 */
function formatRivescriptLine(operator, value) {
  const rivescriptText = `${operator}${config.separators.command}${value.trim()}`;
  return `${rivescriptText}${config.separators.line}`;
}

/**
 * @param {String} triggerText
 * @return {String}
 */
function getTriggerRivescriptLine(triggerText) {
  return module.exports.formatRivescriptLine(config.commands.trigger, triggerText);
}

/**
 * @param {String} triggerText
 * @param {String} redirectText
 * @return {Array}
 */
function getRedirectRivescript(triggerText, redirectText) {
  return module.exports.joinRivescriptLines([
    module.exports.getTriggerRivescriptLine(triggerText),
    module.exports.formatRivescriptLine(config.commands.redirect, redirectText),
  ]);
}

/**
 * @param {String} triggerText
 * @param {String} redirectText
 * @return {Array}
 */
function getReplyRivescript(defaultTopicTrigger) {
  const triggerLine = module.exports.getTriggerRivescriptLine(defaultTopicTrigger.trigger);

  let replyText = defaultTopicTrigger.reply;
  const topic = defaultTopicTrigger.topic;
  const hasTopic = topic && topic.id;

  // Support triggers that directly reference a topic instead of a transition.
  // TODO: Remove this once all defaultTopicTriggers are backfilled with transitions.
  if (!replyText && hasTopic) {
    if (topic.type === 'photoPostConfig') {
      replyText = topic.templates.startPhotoPost.text;
    } else if (topic.type === 'textPostConfig') {
      replyText = topic.templates.askText.text;
    } else if (topic.type === 'externalPostConfig') {
      replyText = topic.templates.startExternalPost.text;
    }
  }

  const replyTextByLine = replyText.split(config.separators.line);
  const replyLines = replyTextByLine.map((text, index) => {
    if (index === 0) {
      return module.exports.formatRivescriptLine(config.commands.reply, text);
    }
    if (index === replyTextByLine.length - 1 && hasTopic) {
      const textWithTopicChange = `${text}{topic=${topic.id}}`;
      return module.exports.formatRivescriptLine(config.commands.newline, textWithTopicChange);
    }

    // Note: sending through an empty space here throws a Rivescript error:
    // Weird single-character line '^' found (in topic random) at stream()
    // Rivescript doesn't complain if we escape the new line character as '\\n' but it creates an
    // extra line break. I'm not having any luck appending the '\\n' character to the beginning or
    // end of the text within a newline.
    return module.exports.formatRivescriptLine(config.commands.newline, text || '-');
  });

  return module.exports.joinRivescriptLines([triggerLine].concat(replyLines));
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

  return module.exports.getReplyRivescript(defaultTopicTrigger);
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
 * @return {Boolean}
 */
function isBotReady() {
  return rivescript.isReady();
}

/**
 * @return {Promise}
 */
async function isRivescriptCurrent() {
  const cache = await helpers.cache.rivescript.get(cacheKey);
  if (!cache) {
    logger.debug('isRivescriptCurrent cache miss');
    return false;
  }
  const result = underscore.isEqual(cache, rivescript.getAdditionalRivescripts());
  logger.debug('isRivescriptCurrent', { result });
  return result;
}

/**
 * @param {String} userId
 * @param {String} topicId
 * @param {String} messageText
 * @return {Promise}
 */
async function getBotReply(userId, topicId, messageText = '') {
  const isCurrent = await module.exports.isRivescriptCurrent();
  if (!isCurrent) {
    await module.exports.loadBot();
  }
  /**
   * If our inbound message doesn't contain anything alphanumeric, by default we want to trigger
   * the wildcard reply for whatever topic we're in. Passing an empty strings or emoji while in a
   * non-default Rivescript topic seems to trigger a topic change to the default topic, causing
   * unwanted behavior.
   * @see https://www.pivotaltracker.com/n/projects/2092729/stories/158439950
   *
   * Note: this default we're using if not alphanumeric shouldn't potentially match any Rivescript
   * triggers, e.g. passing "no text found" could trigger a "no" trigger in an askYesNo.
   */
  const userMessageText = helpers.util.containsAlphanumeric(messageText) ? messageText : 'catchAll';
  // If Rivescript bot receives a message in a topic that it doesn't know about, it logs a
  // "User x was in an empty topic Y" message to the console. This avoids that message.
  const rivescriptTopicId = helpers.topic
    .isRivescriptTopicId(topicId) ? topicId : helpers.topic.getDefaultTopicId();
  return rivescript.getBotReply(userId, rivescriptTopicId, userMessageText);
}

/**
 * @param {String} messageText
 * @return {Promise}
 */
function parseAskVotingPlanStatusResponse(messageText) {
  // We call this helper's getBotReply to DRY checking that our messageText contains alphanumeric.
  // TODO: Grab these hardcoded id's from config.
  return module.exports.getBotReply('global', 'ask_voting_plan_status', messageText).then(res => res.text);
}

/**
 * @param {String} messageText
 * @return {Promise}
 */
function parseAskYesNoResponse(messageText) {
  // We call this helper's getBotReply to DRY checking that our messageText contains alphanumeric.
  // TODO: Grab these hardcoded id's from config.
  return module.exports.getBotReply('global', 'ask_yes_no', messageText).then(res => res.text);
}

module.exports = {
  fetchRivescripts,
  formatRivescriptLine,
  getBotReply,
  getDeparsedRivescript,
  getRedirectRivescript,
  getReplyRivescript,
  getRivescriptFromDefaultTopicTrigger,
  getRivescripts,
  getTriggerRivescriptLine,
  isBotReady,
  isRivescriptCurrent,
  joinRivescriptLines,
  loadBot,
  parseAskVotingPlanStatusResponse,
  parseAskYesNoResponse,
  parseRivescript,
};
