'use strict';

const RiveScript = require('rivescript');
const logger = require('./logger');
const config = require('../config/lib/rivescript');

let additionalRivescripts;
let brain;
let hasSortedReplies;

function createNewBot() {
  try {
    brain = new RiveScript({ debug: config.debug, concat: config.concat });
    hasSortedReplies = false;
    return brain;
  } catch (err) {
    logger.error('createNewBot error', err);
    throw new Error(err.message);
  }
}

/**
 * @return {Array}
 */
function getAdditionalRivescripts() {
  return additionalRivescripts;
}

/**
 * Sets brain to new RiveScript instance if not set already.
 */
function getBot() {
  if (!brain) {
    return createNewBot();
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
 * @return {Promise}
 */
function streamAndSortReplies() {
  // @see https://github.com/aichaos/rivescript-js/blob/master/docs/rivescript.md#bool-stream-string-code-func-onerror
  additionalRivescripts.forEach(item => brain.stream(item, logStreamError));
  logger.info('rivescript.brain.stream success');
  brain.sortReplies();
  logger.info('rivescript.brain.sortReplies success');
  hasSortedReplies = true;
  return Promise.resolve();
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
 * @param {Array} rivescripts - Rivescript parsed from the Content API
 */
async function loadBotWithRivescripts(rivescripts) {
  if (!rivescripts || rivescripts.length === 0) {
    throw new Error('loadBotWithRivescripts missing required rivescripts arg');
  }
  logger.debug('loadBotWithRivescripts');
  // Purge all loaded Rivescript.
  createNewBot();
  // Loaded hardcoded Rivescript.
  await brain.loadDirectory(config.directory);
  // Stream and sort additional Rivescript.
  additionalRivescripts = rivescripts;
  return module.exports.streamAndSortReplies();
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
  getAdditionalRivescripts,
  getBot,
  getBotReply,
  isReady,
  loadBotWithRivescripts,
  streamAndSortReplies,
};
