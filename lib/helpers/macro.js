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
function isInvalidVotingPlanStatus(macroName) {
  return (macroName === module.exports.macros.invalidVotingPlanStatus());
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
 * @param {String} macroName
 * @return {Boolean}
 */
function isVotingPlanStatusVoting(macroName) {
  return (macroName === module.exports.macros.votingPlanStatusVoting());
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
  isInvalidVotingPlanStatus,
  isMacro,
  isSaidNo,
  isSaidYes,
  isVotingPlanStatusVoting,
  macros: {
    invalidVotingPlanStatus: () => getMacroForKey('invalidVotingPlanStatus'),
    saidNo: () => getMacroForKey('saidNo'),
    saidYes: () => getMacroForKey('saidYes'),
    subscriptionStatusActive: () => getMacroForKey('subscriptionStatusActive'),
    subscriptionStatusLess: () => getMacroForKey('subscriptionStatusLess'),
    subscriptionStatusNeedMoreInfo: () => getMacroForKey('subscriptionStatusNeedMoreInfo'),
    subscriptionStatusStop: () => getMacroForKey('subscriptionStatusStop'),
    votingPlanStatusVoting: () => getMacroForKey('votingPlanStatusVoting'),
  },
};
