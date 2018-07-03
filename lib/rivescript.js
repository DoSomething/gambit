'use strict';

const RiveScript = require('rivescript');
const logger = require('heroku-logger');
const config = require('../config/lib/rivescript');

let brain;

function loadingDone(batchNumber) {
  logger.debug('rivescript.loadingDone', { batchNumber });

  brain.sortReplies();
  brain.ready = true;
}

function loadingError(error) {
  // We need case sensitive topics because we're naming them with Contentful ID's.
  // Confirmed with https://github.com/kirsle that lowercase error is a design choice.
  // @see https://botmakers.slack.com/archives/C16TE8YMA/p1526572280000539
  if (!error.includes('Topics should be lowercased')) {
    logger.error('bot.loadingError', { error });
  }
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
    .then((text) => {
      if (!bot.ready) {
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
