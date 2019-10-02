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
 * Gets a payload object with property and values that must be updated in an user's
 * profile based on the macro name argument.
 * @param {String} macroName
 * @return {Object}
 */
function getProfileUpdate(macroName) {
  const macro = config.macros[macroName];
  const payload = {};
  if (!macro || !macro.profileUpdate) {
    return payload;
  }
  payload[macro.profileUpdate.field] = macro.profileUpdate.value;
  return payload;
}

/**
 * @param {String} macroName
 * @return {Boolean}
 */
function isCompletedVotingPlan(macroName) {
  return macroName && macroName.includes(config.completedVotingPlanMacro);
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

function isNoReply(macroName) {
  return (macroName === module.exports.macros.noReply());
}

function getMacro(macroName) {
  return config.macros[macroName];
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
  getMacro,
  getProfileUpdate,
  isCompletedVotingPlan,
  isMacro,
  isNoReply,
  isSaidNo,
  isSaidYes,
  macros: {
    invalidAskMultipleChoiceResponse: () => getMacroForKey('invalidAskMultipleChoiceResponse'),
    invalidAskVotingPlanStatusResponse: () => getMacroForKey('invalidAskVotingPlanStatusResponse'),
    noReply: () => getMacroForKey('noReply'),
    saidFirstChoice: () => getMacroForKey('saidFirstChoice'),
    saidSecondChoice: () => getMacroForKey('saidSecondChoice'),
    saidThirdChoice: () => getMacroForKey('saidThirdChoice'),
    saidFourthChoice: () => getMacroForKey('saidFourthChoice'),
    saidFifthChoice: () => getMacroForKey('saidFifthChoice'),
    saidNo: () => getMacroForKey('saidNo'),
    saidYes: () => getMacroForKey('saidYes'),
    subscriptionStatusActive: () => getMacroForKey('subscriptionStatusActive'),
    subscriptionStatusLess: () => getMacroForKey('subscriptionStatusLess'),
    subscriptionStatusNeedMoreInfo: () => getMacroForKey('subscriptionStatusNeedMoreInfo'),
    subscriptionStatusStop: () => getMacroForKey('subscriptionStatusStop'),
    votingPlanStatusCantVote: () => getMacroForKey('votingPlanStatusCantVote'),
    votingPlanStatusNotVoting: () => getMacroForKey('votingPlanStatusNotVoting'),
    votingPlanStatusVoted: () => getMacroForKey('votingPlanStatusVoted'),
    votingPlanStatusVoting: () => getMacroForKey('votingPlanStatusVoting'),
  },
};
