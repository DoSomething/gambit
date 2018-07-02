'use strict';

const config = require('../../config/lib/helpers/macro');

function getMacroForKey(key) {
  return config.macros[key];
}

/**
 * @param {String} topicId
 * @return {String}
 */
function getChangeTopicMacroFromTopicId(topicId) {
  const changeTopicMacro = module.exports.macros.changeTopic();
  return `${changeTopicMacro}{topic=${topicId}}`;
}

/**
 * @param {String} macroName
 * @return {Boolean}
 */
function isChangeTopic(macroName) {
  return (macroName === module.exports.macros.changeTopic());
}

/**
 * @param {String} macroName
 * @return {Boolean}
 */
function isConfirmedTopic(macroName) {
  return (macroName === module.exports.macros.confirmedTopic());
}

/**
 * @param {String} macroName
 * @return {Boolean}
 */
function isDeclinedTopic(macroName) {
  return (macroName === module.exports.macros.declinedTopic());
}

/**
 * Is given string a Rivescript macro?
 * @param {String} text
 * @return {Boolean}
 */
function isMacro(text) {
  return !!getMacroForKey(text);
}

module.exports = {
  getChangeTopicMacroFromTopicId,
  /**
   * @param {string} macroName
   * @return {string}
   */
  getReply: function getReply(macroName) {
    return config.replies[macroName];
  },
  isChangeTopic,
  isConfirmedTopic,
  isDeclinedTopic,
  isMacro,
  macros: {
    catchAll: () => getMacroForKey('catchAll'),
    changeTopic: () => getMacroForKey('changeTopic'),
    confirmedTopic: () => getMacroForKey('confirmedTopic'),
    createdUser: () => getMacroForKey('createdUser'),
    declinedTopic: () => getMacroForKey('declinedTopic'),
    menu: () => getMacroForKey('menu'),
    noReply: () => getMacroForKey('noReply'),
    sendCrisisMessage: () => getMacroForKey('sendCrisisMessage'),
    sendInfoMessage: () => getMacroForKey('sendInfoMessage'),
    subscriptionStatusActive: () => getMacroForKey('subscriptionStatusActive'),
    subscriptionStatusLess: () => getMacroForKey('subscriptionStatusLess'),
    subscriptionStatusResubscribed: () => getMacroForKey('subscriptionStatusResubscribed'),
    subscriptionStatusStop: () => getMacroForKey('subscriptionStatusStop'),
    supportRequested: () => getMacroForKey('supportRequested'),
  },
  isMenu: function isMenu(text) {
    return (text === this.macros.menu());
  },
  isSendCrisisMessage: function isSendCrisisMessage(text) {
    return (text === this.macros.sendCrisisMessage());
  },
  isSendInfoMessage: function isSendInfoMessage(text) {
    return (text === this.macros.sendInfoMessage());
  },
  isSubscriptionStatusActive: function isSubscriptionStatusActive(text) {
    return (text === this.macros.subscriptionStatusActive());
  },
  isSubscriptionStatusLess: function isSubscriptionStatusLess(text) {
    return (text === this.macros.subscriptionStatusLess());
  },
  isSubscriptionStatusResubscribed: function isSubscriptionStatusResubscribed(text) {
    return (text === this.macros.subscriptionStatusResubscribed());
  },
  isSubscriptionStatusStop: function isSubscriptionStatusStop(text) {
    return (text === this.macros.subscriptionStatusStop());
  },
  isSupportRequested: function isSupportRequested(text) {
    return (text === this.macros.supportRequested());
  },
};
