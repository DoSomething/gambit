'use strict';

const fs = require('fs');
const RiveScript = require('rivescript');

/**
 * Setup.
 */
let bot;

function loadBotMacros() {
  const macros = [
    {
      name: 'support-crisis',
      weight: 100,
      handler: process.env.REPLY_MSG_SUPPORT_CRISIS,
    },
    {
      name: 'support-help',
      weight: 80,
      handler: process.env.REPLY_MSG_SUPPORT_HELP,
    },
  ];
  macros.forEach((macro) => {
    // Each txt file in brain/macros stores triggers to call the macro filename.
    fs.readFile(`brain/macros/${macro.name}.txt`, 'utf8', (err, data) => {
      if (err) {
        console.log(err);
      }
      data.split('\n').forEach((trigger) => {
        // TODO: Add prority weight if exists.
        const code = `+ ${trigger}\n- <call>${macro.name}</call>\n`;
        bot.stream(code);
      });
      bot.setSubroutine(macro.name, () => macro.handler);
    });
  })
}

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
    loadBotMacros();
    bot.loadDirectory('brain/scripts', loadingDone, loadingError);
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
    return bot.replyAsync(userId, userMessage)
      .then((reply) => {
        console.log(bot.getUservars(userId));
      })
      .catch(error => console.log(error));
  }

  return 'ERR: Bot Not Ready Yet';
};
