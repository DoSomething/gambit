'use strict';

const config = require('../../config/lib/helpers/macro');

const changeTopicPrefix = config.changeTopicPrefix;

/**
 * @param {String} key
 * @return {String}
 */
function getMacroForKey(key) {
  return config.macros[key];
}

/**
 * @param {String} topicId
 * @return {String}
 */
function getChangeTopicMacroFromTopicId(topicId) {
  return `${changeTopicPrefix}${topicId}`;
}

/**
 * @param {String} macroName
 * @return {String}
 */
function getTopicIdFromChangeTopicMacro(macroName) {
  return macroName.substring(changeTopicPrefix.length);
}

module.exports = {
  /**
   * @param {string} macroName
   * @return {string}
   */
  getReply: function getReply(macroName) {
    return config.replies[macroName];
  },
  getChangeTopicMacroFromTopicId,
  getTopicIdFromChangeTopicMacro,
  /**
   * Is given string a Rivescript macro?
   */
  isMacro: function isMacro(text) {
    if (this.isChangeTopic(text)) {
      return true;
    }
    return getMacroForKey(text);
  },
  macros: {
    campaignMenu: () => getMacroForKey('campaignMenu'),
    confirmedCampaign: () => getMacroForKey('confirmedCampaign'),
    declinedCampaign: () => getMacroForKey('declinedCampaign'),
    gambit: () => getMacroForKey('gambit'),
    sendCrisisMessage: () => getMacroForKey('sendCrisisMessage'),
    sendInfoMessage: () => getMacroForKey('sendInfoMessage'),
    subscriptionStatusLess: () => getMacroForKey('subscriptionStatusLess'),
    subscriptionStatusStop: () => getMacroForKey('subscriptionStatusStop'),
    supportRequested: () => getMacroForKey('supportRequested'),
  },
  isChangeTopic: function isChangeTopic(text) {
    return text.includes(changeTopicPrefix);
  },
  isConfirmedCampaign: function isConfirmedCampaign(text) {
    return (text === this.macros.confirmedCampaign());
  },
  isDeclinedCampaign: function isDeclinedCampaign(text) {
    return (text === this.macros.declinedCampaign());
  },
  isCampaignMenu: function isCampaignMenu(text) {
    return (text === this.macros.campaignMenu());
  },
  isSendCrisisMessage: function isSendCrisisMessage(text) {
    return (text === this.macros.sendCrisisMessage());
  },
  isSendInfoMessage: function isSendInfoMessage(text) {
    return (text === this.macros.sendInfoMessage());
  },
  isSubscriptionStatusLess: function isSubscriptionStatusLess(text) {
    return (text === this.macros.subscriptionStatusLess());
  },
  isSubscriptionStatusStop: function isSubscriptionStatusStop(text) {
    return (text === this.macros.subscriptionStatusStop());
  },
  isSupportRequested: function isSupportRequested(text) {
    return (text === this.macros.supportRequested());
  },
};
