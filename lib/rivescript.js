'use strict';

const RiveScript = require('rivescript');
const logger = require('heroku-logger');
const config = require('../config/lib/rivescript');

const defaultTopic = 'random';

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
 * Saves topic to bot.uservars for given platformUserId.
 * @see getReply
 *
 * @param {string} platformUserId
 * @param {string} topic
 * @return {string}
 */
function setTopicForplatformUserId(platformUserId, topic) {
  const bot = exports.getBot();
  logger.trace('bot.setTopicForplatformUserId', { topic });

  return bot.setUservars(platformUserId, { topic });
}

/**
 * Returns Rivescript bot reply message to given userMessage from given platformUserId.
 *
 * @param {User} user
 * @param {string} userMessage
 * @return {object}
 */
module.exports.getReply = function (user, userMessage) {
  const platformUserId = user._id;
  logger.debug('bot.getReply', { platformUserId, userMessage });
  const bot = exports.getBot();

  // Load the user's current topic into bot uservars to continue conversation.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  setTopicForplatformUserId(platformUserId, user.topic);

  return bot.replyAsync(platformUserId, userMessage).then((botReply) => {
    // The user's topic may have changed, so we'll store uservars along with our reply when
    // parsing response in middleware.
    const uservars = bot.getUservars(platformUserId);
    const topic = uservars.topic;

    const reply = {
      brain: botReply,
      topic,
    };
    logger.debug('bot.getReply.response', reply);
    return reply;
  })
    .catch(err => err);
};

/**
 * Returns topic saved in the bot for given platformUserId.
 *
 * @param {string} platformUserId
 * @return {string}
 */
module.exports.getTopicForplatformUserId = function (platformUserId) {
  logger.trace('bot.getTopicForplatformUserId', { platformUserId });
  const bot = exports.getBot();

  const uservars = bot.getUservars(platformUserId);
  logger.debug('bot.getTopicForplatformUserId', { uservars });
  if (!uservars) {
    return defaultTopic;
  }

  return uservars.topic;
};
