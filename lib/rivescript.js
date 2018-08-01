'use strict';

const RiveScript = require('rivescript');
const logger = require('heroku-logger');
const config = require('../config/lib/rivescript');

let brain;
let additionalRivescripts;
// If our Rivescript bot receives a user message before the replies are sorted, it sends an reply
// with a hardcoded error message, 'ERR: Replies Not Sorted'.
// @see https://github.com/aichaos/rivescript-js/blob/v1.17.2/src/brain.coffee#L265
// This is set to true once replies have been sorted and the bot is able to respond.
let hasSortedReplies = false;

function handleError(error) {
  logger.error('rivescript.handleError', { error });
}

function loadingDone() {
  logger.info('rivescript.brain.loadDirectory success');
  // Loads our saved additionalRivescript into the brain.
  // @see https://github.com/aichaos/rivescript-js/blob/v1.17.2/docs/rivescript.md#bool-stream-string-code-func-onerror
  // Note: Currently editors are required to use Rivescript syntax if creating a message entry to
  // be referenced by a defaultTopicTrigger.response.
  // TODO: Stream each trigger only if it has valid syntax:
  // @see https://github.com/aichaos/rivescript-js/blob/master/docs/parser.md#string-checksyntax-char-command-string-line
  additionalRivescripts.forEach(item => brain.stream(item, handleError));
  logger.info('rivescript.brain.stream success');
  brain.sortReplies();
  logger.info('rivescript.brain.sortReplies success');
  hasSortedReplies = true;
}

/**
 * Creates and returns a Rivescript bot.
 *
 * @return {Object}
 */
function createNewBot(data) {
  try {
    additionalRivescripts = data;
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
    throw new Error('rivescript.brain undefined');
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
