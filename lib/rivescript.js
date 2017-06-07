'use strict';

const RiveScript = require('rivescript');

/**
 * Setup.
 */
let bot;

function loadingDone(batchNumber) {
  bot.sortReplies();
  bot.ready = true;
}

function loadingError(error, batchNumber) {
  console.error('Loading error: ' + error);
}

/**
 * Creates and returns a Rivescript bot.
 *
 * @return {Object}
 */
module.exports.createNewBot = function createNewBot() {
  try {
    bot = new RiveScript({
      debug:   process.env.DEBUG,
      concat:  'newline',
    });
    bot.ready = false;
    bot.loadDirectory('brain/rivescript', loadingDone, loadingError);
  } catch (err) {
    console.log(err);
  }
  return bot;
};

/**
 * Creates and returns a new Rivescript bot if one doesn't exist yet.
 *
 * @return {Object}
 */
module.exports.getBot = function getBot() {
  if (!bot) {
    return exports.createNewBot();
  }
  return bot;
};

/**
 * Returns bot reply message to given userMessage from given userId.
 *
 * @param {string} userId
 * @param {string} userMessage
 * @return {string}
 */
module.exports.getReplyForUserMessage = function getReplyForUserMessage(userId, userMessage) {
  const bot = exports.getBot();

  if (bot && bot.ready) {
    return bot.reply(userId, userMessage);
  }

  return 'ERR: Bot Not Ready Yet';
}

