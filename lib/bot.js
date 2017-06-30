'use strict';

const RiveScript = require('rivescript');
const logger = require('heroku-logger');
const Campaigns = require('../app/models/Campaign');
const config = require('../config/lib/bot');

const defaultTopic = 'random';

let brain;

function loadingDone(batchNumber) {
  console.log(`bot.loadingDone:${batchNumber}`);

  brain.sortReplies();
  brain.ready = true;

  // TODO: Move this into our server.
  if (process.env.DS_GAMBIT_CAMPAIGNS_SYNC) {
    Campaigns.fetchIndex();
  }
}

function loadingError(err) {
  logger.error('bot.loadingError', err);
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
  if (! brain) {
    return exports.createNewBot();
  }
  return brain;
};

/**
 * Saves topic to bot.uservars for given userId.
 * @see getReply
 *
 * @param {string} userId
 * @param {string} topic
 * @return {string}
 */
function setTopicForUserId(userId, topic) {
  const bot = exports.getBot();
  logger.trace('bot.setTopicForUserId', { topic });

  return bot.setUservars(userId, { topic });
}

/**
 * Returns Rivescript bot reply message to given userMessage from given userId.
 *
 * @param {User} user
 * @param {string} userMessage
 * @return {object}
 */
module.exports.getReply = function (user, userMessage) {
  const userId = user._id;
  logger.debug('bot.getReply', { userId, userMessage });
  const bot = exports.getBot();

  // Load the user's current topic into bot uservars to continue conversation.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  setTopicForUserId(userId, user.topic);

  return bot.replyAsync(userId, userMessage).then((botReply) => {
    // The user's topic may have changed, so we'll store uservars along with our reply when
    // parsing response in middleware.
    const uservars = bot.getUservars(userId);
    const topic = uservars.topic;

    const reply = {
      brain: botReply,
      topic,
    };
    logger.debug('bot.getReply response', reply);
    return reply;
  })
  .catch(err => err);
};

/**
 * Returns topic saved in the bot for given userId.
 *
 * @param {string} userId
 * @return {string}
 */
module.exports.getTopicForUserId = function (userId) {
  logger.trace('bot.getTopicForUserId', { userId });
  const bot = exports.getBot();

  const uservars = bot.getUservars(userId);
  logger.debug('bot.getTopicForUserId', { uservars });
  if (! uservars) {
    return defaultTopic;
  }

  return uservars.topic;
};

