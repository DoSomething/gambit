'use strict';

const RiveScript = require('rivescript');
const Campaigns = require('../app/models/Campaign');
const config = require('../config/lib/bot');

let rivescript;

function loadingDone(batchNumber) {
  console.log(`bot.loadingDone:${batchNumber}`);

  rivescript.sortReplies();
  rivescript.ready = true;

  // TODO: Move this into our server.
  if (process.env.DS_GAMBIT_CAMPAIGNS_SYNC) {
    Campaigns.fetchIndex();
  }
}

function loadingError(err) {
  console.error(`Loading error: ${err.message}`);
}

/**
 * Creates and returns a Rivescript bot.
 *
 * @return {Object}
 */
module.exports.createNewBot = function createNewBot() {
  try {
    rivescript = new RiveScript({
      debug: config.debug,
      concat: config.concat,
    });
    rivescript.ready = false;
    rivescript.loadDirectory(config.directory, loadingDone, loadingError);
  } catch (err) {
    console.log(err);
  }
  return rivescript;
};

/**
 * Creates and returns a new Rivescript bot if one doesn't exist yet.
 *
 * @return {Object}
 */
module.exports.getBot = function getBot() {
  if (! rivescript) {
    return exports.createNewBot();
  }
  return rivescript;
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

  return bot.setUservars(userId, { topic });
}

/**
 * Returns Rivescript bot reply message to given userMessage from given userId.
 *
 * @param {User} user
 * @param {string} userMessage
 * @return {string}
 */
module.exports.getReply = function (user, userMessage) {
  const bot = exports.getBot();

  // Load the user's current topic into bot uservars to continue conversation.
  // @see https://github.com/aichaos/rivescript-js/wiki/Asynchronous-Support#user-variable-session-adapters
  setTopicForUserId(user._id, user.topic);

  return bot.replyAsync(user._id, userMessage);
};

/**
 * Returns topic saved in the bot for given userId.
 *
 * @param {string} userId
 * @return {string}
 */
module.exports.getTopicForUserId = function (userId) {
  const bot = exports.getBot();
  const uservars = bot.getUservars(userId);

  return uservars.topic;
};

