'use strict';

const RiveScript = require('rivescript');
const logger = require('heroku-logger');
const config = require('../config/lib/rivescript');

let brain;
let additionalRivescript;
// If our Rivescript bot receives a user message before the replies are sorted, it sends an reply
// with a hardcoded error message, 'ERR: Replies Not Sorted'.
// @see https://github.com/aichaos/rivescript-js/blob/v1.17.2/src/brain.coffee#L265
// We'll set this hasSortedReplies flag to true once replies have been sorted and the bot is able to
// respond to user messages.
let hasSortedReplies = false;

function handleError(error) {
  logger.error('bot.handleError', { error });
}

function loadingDone() {
  logger.info('rivescript.brain.loadDirectory success');
  brain.stream(additionalRivescript, handleError);
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
    additionalRivescript = data;
    brain = new RiveScript({
      debug: config.debug,
      concat: config.concat,
    });
    brain.loadDirectory(config.directory, loadingDone, handleError);
  } catch (err) {
    logger.error('bot.createNewBot', err);
  }
}

/**
 * @param {String} userTopicId
 * @param {String} userMessageText
 * @return {Object}
 */
function getReply(userId, userTopicId, userMessageText) {
  if (!brain) {
    throw new Error('rivescript.brain undefined');
  }
  // Set the Conversation's current topic in bot.uservars.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  brain.setUservars(userId, { topic: userTopicId });

  return brain.replyAsync(userId, userMessageText)
    .then((rivescriptReplyText) => {
      // Throw an error if replies haven't been sorted yet. For SMS member messages, Blink will
      // retry the request and will eventually send user the correct reply when hasSortedReplies.
      /* eslint-disable max-len */
      // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#what-happens-in-reply
      /* eslint-enable max-len */
      if (!hasSortedReplies) {
        throw new Error('Still sorting Rivescript replies.');
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
  getReply,
};
