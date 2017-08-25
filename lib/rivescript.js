'use strict';

const RiveScript = require('rivescript');
const logger = require('heroku-logger');
const config = require('../config/lib/rivescript');

let brain;

function loadingDone(/* batchNumber */) {
  // TODO console.log has to be replaced by other development logging library: Winston?
  // console.log(`bot.loadingDone:${batchNumber}`);

  brain.sortReplies();
  brain.ready = true;
}

function loadingError(error) {
  logger.error('bot.loadingError', { error });
}

/**
 * Creates and returns a Rivescript bot.
 *
 * @return {Object}
 */
module.exports.createNewBot = function createNewBot() {
  try {
    brain = new RiveScript({
      debug: config.debug,
      concat: config.concat,
    });
    brain.ready = false;
    brain.loadDirectory(config.directory, loadingDone, loadingError);
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
  if (!brain) {
    return exports.createNewBot();
  }
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
  // Set the Conversation's current topic in bot.uservars.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  bot.setUservars(conversationId, { topic: conversation.topic });

  return bot.replyAsync(conversationId, inboundMessageText)
    .then((botReplyText) => {
      const reply = { brain: botReplyText };
      // The inbound message may have triggered a topic change, check bot.uservars to return topic.
      const updatedUservars = bot.getUservars(conversationId);
      reply.topic = updatedUservars.topic;
      logger.trace('rivescript.getReply response', reply);

      return reply;
    })
    .catch(err => err);
};
