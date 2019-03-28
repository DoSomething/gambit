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
  isSaidNo,
  isSaidYes,
  macros: {
    invalidAskMultipleChoiceResponse: () => getMacroForKey('invalidAskMultipleChoiceResponse'),
    invalidAskVotingPlanStatusResponse: () => getMacroForKey('invalidAskVotingPlanStatusResponse'),
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
