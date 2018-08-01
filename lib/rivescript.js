'use strict';

const RiveScript = require('rivescript');
const logger = require('heroku-logger');
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
function createNewBot(rivescripts) {
  try {
    additionalRivescripts = rivescripts;
    brain = new RiveScript({
      debug: config.debug,
      concat: config.concat,
    });
    // Note: The v2 release of rivescript-js (still in alpha) returns a Promise, which means any
    // Rivescript errors found when loading will stop the bot from loading entirely. We don't have
    // a need to pass a Contentful ID to a reply because we're no longer adding specific Rivescript
    // for our Content API topics -- but holding off on updating the package for now.
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
    throw new Error('Rivescript bot has not loaded.');
  }
  // Set the Conversation's current topic in bot.uservars.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  brain.setUservars(userId, { topic: topicId });

  return brain.replyAsync(userId, messageText)
    .then((rivescriptReplyText) => {
      if (!hasSortedReplies) {
        throw new Error('Still sorting Rivescript replies, please retry your message.');
      }
      // The inbound message may have triggered a topic change, check bot.uservars to return topic.
      const updatedUservars = brain.getUservars(userId);
      return {
        text: rivescriptReplyText,
        topic: updatedUservars.topic,
        match: updatedUservars.__initialmatch__, // eslint-disable-line no-underscore-dangle
      };
    });
}

module.exports = {
  createNewBot,
  getBotReply,
};
