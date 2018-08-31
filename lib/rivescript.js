'use strict';

const RiveScript = require('rivescript');
const logger = require('./logger');
const config = require('../config/lib/rivescript');

let brain;
let hasSortedReplies = false;

/**
 * Sets brain to new RiveScript instance if not set already.
 */
function getBot() {
  if (!brain) {
    brain = new RiveScript({ debug: config.debug, concat: config.concat });
  }
  return brain;
}

/**
 * @param {Error} error
 */
function logStreamError(error) {
  // A nice to have here would be to alert a Slack channel that there's been an error streaming a
  // particular script.
  logger.error('error streaming rivescript', { error });
}

/**
 * @param {Array} rivescripts
 */
function streamAndSortRepliesWithRivescripts(rivescripts) {
  // @see https://github.com/aichaos/rivescript-js/blob/master/docs/rivescript.md#bool-stream-string-code-func-onerror
  rivescripts.forEach(item => brain.stream(item, logStreamError));
  logger.info('rivescript.brain.stream success');
  brain.sortReplies();
  logger.info('rivescript.brain.sortReplies success');
  hasSortedReplies = true;
}

/**
 * @return {Boolean}
 */
function isReady() {
  return hasSortedReplies;
}

/**
 * Creates a Rivescript bot and loads it with our hardcoded rivescript as well as rivescripts passed
 * in a rivescripts array property.
 *
 * TODO: Don't provide an empty array, return a rejected error.
 * @param {Array} rivescripts - Rivescript parsed from the Content API
 */
function loadBotWithRivescripts(rivescripts = []) {
  logger.debug('loadBotWithRivescripts');
  hasSortedReplies = false;
  return module.exports.getBot().loadDirectory(config.directory)
    .then(() => streamAndSortRepliesWithRivescripts(rivescripts));
}

/**
 * @param {String} userId
 * @param {String} topicId
 * @param {String} messageText
 * @return {Promise}
 */
async function getBotReply(userId, topicId, messageText) {
  logger.debug('getBotReply', { userId, topicId });
  if (!brain) {
    throw new Error('Bot is not loaded, please retry your message.');
  }
  if (!hasSortedReplies) {
    throw new Error('Still sorting bot replies, please retry your message.');
  }

  // Set the Conversation's current topic in bot.uservars.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  await brain.setUservar(userId, 'topic', topicId);

  const rivescriptReplyText = await brain.reply(userId, messageText);

  // The inbound message may have triggered a topic change, inspect bot.uservars for topic value.
  const updatedUservars = await brain.getUservars(userId);

  return {
    text: rivescriptReplyText,
    topicId: updatedUservars[userId].topic,
    match: updatedUservars[userId].__initialmatch__, // eslint-disable-line no-underscore-dangle
  };
}

module.exports = {
  getBot,
  getBotReply,
  isReady,
  loadBotWithRivescripts,
};
