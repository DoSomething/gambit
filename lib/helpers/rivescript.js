'use strict';

const underscore = require('underscore');
const helpers = require('../helpers');
const logger = require('../logger');
const gambitContent = require('../gambit-content');
const rivescript = require('../rivescript');
const config = require('../../config/lib/helpers/rivescript');

const cacheKey = config.cacheKey;

/**
 * @param {String} text
 * @return {String}
 */
function appendEscapedLinebreak(text) {
  return `${text}\\n`;
}

/**
 * @param {String} text
 * @param {String} topicId
 * @return {String}
 */
function appendTopicTag(text, topicId) {
  return `${text}{topic=${topicId}}`;
}

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
  return gambitContent.fetchDefaultTopicTriggers({ cache: false, limit: 150 })
    // TODO: Check our res.meta to determine whether to fetch more triggers.
    .then((res) => {
      logger.debug('fetchDefaultTopicTriggers success', { count: res.data.length });
      return res.data.map(module.exports.parseRivescript);
    })
    .then(rivescripts => helpers.cache.rivescript.set(cacheKey, rivescripts));
}

/**
 * Parses given defaultTopicTrigger as Rivescript code to be streamed by the bot.
 * @see https://github.com/aichaos/rivescript-js/blob/master/docs/rivescript.md#bool-stream-string-code-func-onerror
 *
 * @param {Object} defaultTopicTrigger
 * @return {String}
 */
function parseRivescript(defaultTopicTrigger) {
  if (!defaultTopicTrigger) {
    throw new Error('parseRivescript cannot parse falsy defaultTopicTrigger');
  }

  /**
   * Initialize array of Rivescript lines to be joined. The first line is a trigger command, e.g.
   * + hello
   *
   * @see https://www.rivescript.com/docs/tutorial#the-code-explained
   */
  const lines = [module.exports.formatTriggerRivescript(defaultTopicTrigger.trigger)];

  /**
   * If this is a redirect, the last line should be a redirect command, e.g.
   * @ greetings
   *
   * @see https://www.rivescript.com/docs/tutorial#redirections
   */
  if (defaultTopicTrigger.redirect) {
    lines.push(module.exports.formatRedirectRivescript(defaultTopicTrigger.redirect));
    return module.exports.joinRivescriptLines(lines);
  }

  /**
   * If defaultTopicTrigger isn't a redirect, the next line should be a reply command, e.g.
   * - Hey, how are you today?
   *
   * If defaultTopicTrigger has a topic, the reply command should contain a topic tag, e.g.
   * - Hey, how are you today?{topic=parse_mood}
   *
   * @see https://www.rivescript.com/docs/tutorial#topics
   */
  const topic = defaultTopicTrigger.topic;
  const topicId = topic && topic.id ? topic.id : null;
  // TODO: Should we move handling replies for closed campaign triggers to Content API?
  const closedCampaignText = helpers.replies.templates.campaignClosed().text;
  const replyText = topicId && helpers.topic
    .hasClosedCampaign(topic) ? closedCampaignText : defaultTopicTrigger.reply;

  /**
   * The next line should be the reply command, followed by continuation commands if the replyText
   * contains line breaks, e.g.:
   * - Hey how are you today, it's so good to see you.\n
   * ^ Seriously, it's been a pleasure. Thanks again!
   *
   * @see https://www.rivescript.com/docs/tutorial#line-breaking
   */
  const replyLines = module.exports.formatReplyRivescript(replyText, topicId);

  return module.exports.joinRivescriptLines(lines.concat(replyLines));
}

/**
 * Returns an array of Rivescript lines to be used in tandem with a Rivescript trigger line.
 * @see parseRivescript
 *
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
 * Returns array with a reply command, and continuation commands if the replyText contains any
 * line breaks. Includes topic tag when newTopicId is passed.
 *
 * @param {String} replyText
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
   * Because we're splitting by the newline character, we want to remove any empty strings from the
   * result, we'll account for this by appending an escaped line break to the previous non-empty
   * line (as long as it's not the last line, where we don't need a trailing linebreak).
   */
  const replyTextByLine = underscore.without(replyText.split(config.separators.line), '');
  return replyTextByLine.map((text, index) => {
    const isLastLine = index === replyTextByLine.length - 1;
    // If this isn't the last line, escape the line separator to add a double newline.
    const content = isLastLine ? text : module.exports.appendEscapedLinebreak(text);
    // If trigger contains a topic, append a topic tag to the end of our return Rivescript.
    // @see https://www.rivescript.com/docs/tutorial#topics
    const needsTopicTag = newTopicId && isLastLine;

    return {
      operator: index === 0 ? config.commands.reply : config.commands.continuation,
      value: needsTopicTag ? module.exports.appendTopicTag(content, newTopicId) : content,
    };
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
  return rivescript.getBotReply(userId, topicId, userMessageText);
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
  appendEscapedLinebreak,
  appendTopicTag,
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
