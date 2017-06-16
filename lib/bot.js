'use strict';

const fs = require('fs');
const RiveScript = require('rivescript');
const mongoose = require('../config/mongoose');
const Users = require('../models/User');
const Campaigns = require('../models/Campaign');
const helpers = require('./helpers');

/**
 * Setup.
 */
let bot;

function loadingDone(batchNumber) {
  bot.sortReplies();
  bot.ready = true;
  if (process.env.GAMBIT_SYNC) {
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

  return Users.findOneAndUpdate({ _id: userId }, {}, { upsert: true})
    .then((userDoc) => {
      currentUser = userDoc;
      console.log(`loaded user:${currentUser._id} with topic:${currentUser.topic}`);

      if (currentUser.topic) {
         bot.setUservars(userId, { topic: currentUser.topic });
      }
     
      return bot.replyAsync(userId, userMessage);
    })
    .then((reply) => {
      if (!bot.ready) {
        return 'Try again in a minute, my brain is loading.';
      }

      if (isMacro(reply)) {
        return executeMacro(reply, currentUser, userMessage);
      }

      const botUserVars = bot.getUservars(userId);
      currentUser.topic = botUserVars.topic;
      currentUser.save();

      return reply;
    })
    .then(replyMessage => replyMessage)
    .catch(error => console.log(error));
};

/**
 * Returns whether given Rivescript reply should be handled via macro.
 * @param {string} reply
 * @return {boolean}
 */
function isMacro(reply) {
  const result = (reply === 'post_signup' || reply === 'decline_signup' || reply === 'gambit');
  return result;
}

/**
 * Executes given macro for given User.
 * @param {string} macroName
 * @param {User} user
 * @return {Promise}
 */
function executeMacro(macroName, user, userMessage) {
  if (user.topic === 'michael') {
    return helpers.getInvalidMichaelMessage();
  }

  // Did we receive a Campaign keyword?
  // TODO: Remove hardcoded keyword/campaign and query Campaign model for any matching keywords.
  if (userMessage === 'mirror') {
    console.log('keyword');
    return Campaigns.findById(7).then(campaign => postSignup(user, campaign));
  }

  // For menu command, or any other non-campaign topic, prompt Signup for a random Campaign.
  if (userMessage === 'menu' || !user.hasCampaignTopic()) {
    return Campaigns.getRandomCampaign().then(campaign => promptSignup(user, campaign));
  }

  // Otherwise we're currently in a conversation for a Campaign.
  return Campaigns.findById(user.campaignId)
    .then((campaign) => {
      if (macroName === 'post_signup') {
        return postSignup(user, campaign);
      }

      if (macroName === 'decline_signup') {
        return declineSignup(user, campaign);
      }

      return campaign.getSignupConfirmedMessage();
    });
}

function promptSignup(user, campaign) {
  return user.promptSignupForCampaign(campaign).then(() => campaign.getSignupPromptMessage());
}

function postSignup(user, campaign) {
  return user.postSignupForCampaign(campaign).then(() => campaign.gambitSignupMenuMessage);
}

function declineSignup(user, campaign) {
  return user.declineSignup().then(() => campaign.getSignupDeclinedMessage());
}
