'use strict';

const fs = require('fs');
const RiveScript = require('rivescript');
const Users = require('../app/models/User');
const Campaigns = require('../app/models/Campaign');
const helpers = require('./helpers');
const config = require('../config/lib/bot');

/**
 * Setup.
 */
let bot;

function loadingDone(batchNumber) {
  bot.sortReplies();
  bot.ready = true;
  if (process.env.DS_GAMBIT_CAMPAIGNS_SYNC) {
    Campaigns.fetchIndex();
  }
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
    bot.loadDirectory('brain', loadingDone, loadingError);
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
 * Returns Rivescript bot reply message to given userMessage from given userId.
 *
 * @param {User} user
 * @param {string} userMessage
 * @return {string}
 */
module.exports.getReplyForUserMessage = function (user, userMessage) {
  const bot = exports.getBot();
  bot.setUservars(user._id, { topic: user.topic });

  return bot.replyAsync(user._id, userMessage);
};

/**
 * Returns whether given botReply should be handled via macro.
 * @param {string} reply
 * @return {boolean}
 */
module.exports.isBotMacro = function (botReply) {
  const macroExistsForReply = config.macroNames.some(macroName => macroName === botReply);
  console.log(`bot.isMacro=${macroExistsForReply}`);

  return macroExistsForReply;
}

/**
 * Sets the topic in bot.uservars for given User model.
 * @param {User} user
 */
module.exports.setTopicForUser = function (user) {
  const bot = exports.getBot();
  let topic = user.topic
  if (!topic) {
    topic = 'random';
  }
  bot.setUservars(user._id, { topic });
  console.log(`bot.setTopicForUser userId=${user._id} topic=${topic}`);
}
