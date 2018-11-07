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
 * Returns Rivescript commands from defaultTopicTrigger.
 *
 * @param {Object} defaultTopicTrigger
 * @return {String}
 */
function parseRivescript(defaultTopicTrigger) {
  if (!defaultTopicTrigger) {
    throw new Error('parseRivescript cannot parse falsy defaultTopicTrigger');
  }

  const lines = [module.exports.formatTriggerRivescript(defaultTopicTrigger.trigger)];

  if (defaultTopicTrigger.redirect) {
    lines.push(module.exports.formatRedirectRivescript(defaultTopicTrigger.redirect));
    return module.exports.joinRivescriptLines(lines);
  }

  const topic = defaultTopicTrigger.topic;
  const topicId = topic && topic.id ? topic.id : null;
  let replyText = defaultTopicTrigger.reply;
  // Triggers that directly reference a topic entry won't have a reply set.
  // TODO: Remove this logic once they are updated to reference transition entries instead.
  if (!replyText && topicId) {
    replyText = helpers.topic.getStartTemplateText(topic);
  }
  const replyLines = module.exports.formatReplyRivescript(replyText, topicId);

  return module.exports.joinRivescriptLines(lines.concat(replyLines));
}

/**
 * @param {String} replyText
 * @param {String} topicId
 * @return {Array}
 */
function formatReplyRivescript(replyText, topicId) {
  return module.exports.parseReplyRivescriptLines(replyText, topicId)
    .map(data => module.exports.formatRivescriptLine(data.operator, data.value));
}

/**
 * Returns a string to be used as a line of Rivescript.
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
 * @param {String} text
 * @return {String}
 */
function formatTriggerRivescript(text) {
  return module.exports.formatRivescriptLine(config.commands.trigger, text);
}

/**
 * @param {String} text
 * @return {String}
 */
function formatRedirectRivescript(text) {
  return module.exports.formatRivescriptLine(config.commands.redirect, text);
}

/**
 * Returns text as an array with a reply command, and continuation commands if the text contains
 * linebreak characters.
 *
 * @param {String} text
 * @param {String} newTopicId
 * @return {Array}
 */
function parseReplyRivescriptLines(replyText, newTopicId) {
  /**
   * We can't stream strings that contain newline characters, as the parser complains that we're
   * sending invalid Rivescript. Handle line breaks by split by newline and parsing as reply and
   * newline commands.
   * @see https://www.rivescript.com/docs/tutorial#line-breaking
   *
   * NOTE: We're assuming each line break should be a double line, as we consistently use this to
   * add a "paragraph" for the longer messages we send (eg. a startPhotoPost).
   */
  const replyTextByLine = replyText.split(config.separators.line);
  const lines = replyTextByLine.map((text, index) => {
    // If null, it's from a double line separator, which we accounted for in the previous item by
    // appending an escaped line separator.
    if (!text) {
      return null;
    }

    const isLastLine = index === replyTextByLine.length - 1;
    // If this isn't the last line, escape the line separator to add a double newline.
    const content = isLastLine ? text : `${text}\\n`;
    // If trigger contains a topic, append a topic tag to the end of our return Rivescript.
    // @see https://www.rivescript.com/docs/tutorial#topics
    const value = newTopicId && isLastLine ? `${content}{topic=${newTopicId}}` : content;
    const operator = index === 0 ? config.commands.reply : config.commands.continuation;
    return { operator, value };
  });
  // Remove null array items.
  return underscore.without(lines, null);
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
  formatRedirectRivescript,
  formatReplyRivescript,
  formatRivescriptLine,
  formatTriggerRivescript,
  getBotReply,
  getDeparsedRivescript,
  getRivescripts,
  isBotReady,
  isRivescriptCurrent,
  joinRivescriptLines,
  loadBot,
  parseAskVotingPlanStatusResponse,
  parseAskYesNoResponse,
  parseReplyRivescriptLines,
  parseRivescript,
};
