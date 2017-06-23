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
      debug: process.env.DEBUG,
      concat: 'newline',
    });
    rivescript.ready = false;
    rivescript.loadDirectory('brain', loadingDone, loadingError);
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
 * Returns Rivescript bot reply message to given userMessage from given userId.
 *
 * @param {User} user
 * @param {string} userMessage
 * @return {string}
 */
module.exports.getReply = function (user, userMessage) {
  const bot = exports.getBot();
  bot.setUservars(user._id, { topic: user.topic });

  return bot.replyAsync(user._id, userMessage);
};

