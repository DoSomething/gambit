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
module.exports.createNewBot = function createNewBot(data) {
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
  return brain;
};

/**
 * Creates and returns a new Rivescript bot if one doesn't exist yet.
 *
 * @return {Object}
 */
module.exports.getBot = function getBot() {
  return brain;
};

/**
 * Returns Rivescript reply message to given inboundMessageText for given conversation.
 *
 * @param {Conversation} conversation
 * @param {string} inboundMessageText
 * @return {object}
 */
module.exports.getReply = function (conversation, inboundMessageText) {
  const conversationId = conversation._id;

  const bot = exports.getBot();
  if (!bot) {
    throw new Error('bot undefined');
  }
  // Set the Conversation's current topic in bot.uservars.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  bot.setUservars(conversationId, { topic: conversation.topic });

  return bot.replyAsync(conversationId, inboundMessageText)
    .then((text) => {
      // Throw an error if replies haven't been sorted yet. For SMS member messages, Blink will
      // retry the request and will eventually send user the correct reply when hasSortedReplies.
      /* eslint-disable max-len */
      // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#what-happens-in-reply
      /* eslint-enable max-len */
      if (!hasSortedReplies) {
        throw new Error('Still sorting Rivescript replies.');
      }
      const res = { text };
      // The inbound message may have triggered a topic change, check bot.uservars to return topic.
      const updatedUservars = bot.getUservars(conversationId);
      res.topic = updatedUservars.topic;
      res.match = updatedUservars.__initialmatch__; // eslint-disable-line no-underscore-dangle

      return res;
    });
};
