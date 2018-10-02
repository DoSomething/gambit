'use strict';

const logger = require('../logger');
const config = require('../../config/lib/helpers/macro');

/**
 * @return {String}
 */
function getMacroForKey(key) {
  if (!config.macros[key]) {
    return null;
  }
  return config.macros[key].name;
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
 * @return {String}
 */
function getReplyText(macroName) {
  const macroConfig = config.macros[macroName];
  return macroConfig ? macroConfig.text : null;
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
function isSaidNo(macroName) {
  return (macroName === module.exports.macros.saidNo());
}

/**
 * @param {String} macroName
 * @return {Boolean}
 */
function isSaidYes(macroName) {
  return (macroName === module.exports.macros.saidYes());
}

/**
 * Is given string a Rivescript macro?
 * @param {String} text
 * @return {Boolean}
 */
function isMacro(text) {
  const result = !!getMacroForKey(text);
  logger.debug('macro.isMacro', { text, result });
  return result;
}

module.exports = {
  getChangeTopicMacroFromTopicId,
  getReplyText,
  isChangeTopic,
  isMacro,
  isSaidNo,
  isSaidYes,
  macros: {
    catchAll: () => getMacroForKey('catchAll'),
    changeTopic: () => getMacroForKey('changeTopic'),
    noReply: () => getMacroForKey('noReply'),
    saidNo: () => getMacroForKey('saidNo'),
    saidYes: () => getMacroForKey('saidYes'),
    sendCrisisMessage: () => getMacroForKey('sendCrisisMessage'),
    sendInfoMessage: () => getMacroForKey('sendInfoMessage'),
    subscriptionStatusActive: () => getMacroForKey('subscriptionStatusActive'),
    subscriptionStatusLess: () => getMacroForKey('subscriptionStatusLess'),
    subscriptionStatusResubscribed: () => getMacroForKey('subscriptionStatusResubscribed'),
    subscriptionStatusStop: () => getMacroForKey('subscriptionStatusStop'),
    supportRequested: () => getMacroForKey('supportRequested'),
  },
  isSupportRequested: function isSupportRequested(text) {
    return (text === this.macros.supportRequested());
  },
};
