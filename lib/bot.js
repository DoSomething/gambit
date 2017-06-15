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
        return executeMacro(reply, currentUser);
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
function executeMacro(macroName, user) {
  if (user.topic === 'michael') {
    return helpers.getInvalidMichaelMessage();
  }

  let campaign;

  // For any other non-campaign topic, bring it back to a random Campaign.
  if (!user.topic || user.topic.indexOf('campaign') < 0) {
    return Campaigns.getRandomCampaign()
      .then((randomCampaign) => {
        campaign = randomCampaign;

        return user.promptSignupForCampaignId(campaign._id);
      })
      .then(() => campaign.getSignupPromptMessage());
  }

  // Otherwise we're in a conversation about a Campaign.
  // TODO: Use Mongoose populate to avoid extra lookup here.
  return Campaigns.findById(user.campaignId)
    .then((currentCampaign) => {
      campaign = currentCampaign;

      if (macroName === 'post_signup') {
        return user.postSignup().then(() => campaign.gambitSignupMenuMessage);
      }

      if (macroName === 'decline_signup') {
        return user.declineSignup().then(() => campaign.getSignupDeclinedMessage());
      }

      // TODO: Continue/completed message based on user.signupStatus.
      return campaign.getSignupConfirmedMessage();
    });
}
