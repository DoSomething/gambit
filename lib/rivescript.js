'use strict';

const fs = require('fs');
const RiveScript = require('rivescript');
const mongoose = require('../config/mongoose');
const Users = require('../models/User');

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
 * Returns bot reply message to given userMessage from given userId.
 *
 * @param {string} userId
 * @param {string} userMessage
 * @return {string}
 */
module.exports.getReplyForUserMessage = function (userId, userMessage) {
  const bot = exports.getBot();
  let currentUser;
  let replyMessage;

  return Users.findById(userId)
    .then((userDoc) => {
      if (userDoc) {
        currentUser = userDoc;
        console.log(`found user:${userDoc._id} with topic:${userDoc.topic}`);
        bot.setUservars(userId, {
          topic: userDoc.topic,
        });
      }
      return bot.replyAsync(userId, userMessage);
    })
    .then((reply) => {
      if (!bot.ready) {
        replyMessage = 'Try again in a minute, my brain is loading.';
        return;
      }

      // If we didn't find any Rivescript triggers, send incoming message to Gambit for reply.
      if (reply === 'gambit') {
        replyMessage = currentUser.getGambitReplyToIncomingMessage(userMessage);
        return;
      }

      replyMessage = reply;
      const userVars = bot.getUservars(userId);

      return Users.findOneAndUpdate({ _id: userId }, { topic: userVars.topic }, { upsert: true })
    })
    .then((userDoc) => {
      console.log(userDoc);

      return replyMessage;
    })
    .catch(error => console.log(error));
};
