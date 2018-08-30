'use strict';

const RiveScript = require('rivescript');
const logger = require('./logger');
const config = require('../config/lib/rivescript');

let brain;
let hasSortedReplies = false;

function getBot() {
  if (!brain) {
    brain = new RiveScript({ debug: config.debug, concat: config.concat });
  }
  return brain;
}

function logStreamError(error) {
  logger.error('error streaming rivescript', { error });
}

function streamAndSortRepliesWithRivescripts(rivescripts) {
  rivescripts.forEach(item => brain.stream(item, logStreamError));
  logger.info('rivescript.brain.stream success');
  brain.sortReplies();
  logger.info('rivescript.brain.sortReplies success');
  hasSortedReplies = true;
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
  return module.exports.getBot().loadDirectory(config.directory)
    .then(() => streamAndSortRepliesWithRivescripts(rivescripts));
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

  return brain.reply(userId, messageText)
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
  getBot,
  getBotReply,
  loadBotWithRivescripts,
};
