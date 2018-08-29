'use strict';

const RiveScript = require('rivescript');
const logger = require('./logger');
const config = require('../config/lib/rivescript');

let brain;
let additionalRivescripts;
let hasSortedReplies = false;

function handleError(error) {
  logger.error('rivescript.handleError', { error });
}

function loadingDone() {
  logger.info('rivescript.brain.loadDirectory success');
  // Loads our saved additionalRivescript into the brain.
  // @see https://github.com/aichaos/rivescript-js/blob/v1.17.2/docs/rivescript.md#bool-stream-string-code-func-onerror
  additionalRivescripts.forEach(item => brain.stream(item, handleError));
  logger.info('rivescript.brain.stream success');
  brain.sortReplies();
  logger.info('rivescript.brain.sortReplies success');
  hasSortedReplies = true;
}

/**
 * Creates a Rivescript bot and loads it with our hardcoded rivescript as well as rivescripts passed
 * in a rivescripts array property.
 *
 * @param {Array} rivescripts
 */
function loadBotWithRivescripts(rivescripts = []) {
  logger.debug('loadBotWithRivescripts');
  additionalRivescripts = rivescripts;
  hasSortedReplies = false;
  try {
    if (!brain) {
      brain = new RiveScript({ debug: config.debug, concat: config.concat });
    }
    brain.loadDirectory(config.directory, loadingDone, handleError);
  } catch (err) {
    logger.error('bot.createNewBot', err);
  }
}

/**
 * @param {String} userId
 * @param {String} topicId
 * @param {String} messageText
 * @return {Promise}
 */
function getBotReply(userId, topicId, messageText) {
  if (!brain) {
    return Promise.reject(Error('Bot is not loaded, please retry your message.'));
  }
  // Set the Conversation's current topic in bot.uservars.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  brain.setUservars(userId, { topic: topicId });

  return brain.replyAsync(userId, messageText)
    .then((rivescriptReplyText) => {
      if (!hasSortedReplies) {
        throw new Error('Still sorting bot replies, please retry your message.');
      }
      // The inbound message may have triggered a topic change, check bot.uservars to return topic.
      const updatedUservars = brain.getUservars(userId);
      return {
        text: rivescriptReplyText,
        topicId: updatedUservars.topic,
        match: updatedUservars.__initialmatch__, // eslint-disable-line no-underscore-dangle
      };
    });
}

module.exports = {
  loadBotWithRivescripts,
  getBotReply,
};
