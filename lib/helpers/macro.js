'use strict';

const logger = require('../logger');
const config = require('../../config/lib/helpers/macro');

/**
 * Is given string a Rivescript macro?
 */
module.exports.isMacro = function (text) {
  const result = config.macros[text];
  logger.debug('helpers.macro.isMacro', { result });

  return result;
};

/**
 * Helpers to check if given string is a specific macro.
 */
module.exports.isConfirmedCampaign = function (text) {
  return (text === config.macros.confirmedCampaign);
};

module.exports.isDeclinedCampaign = function (text) {
  return (text === config.macros.declinedCampaign);
};

module.exports.isPitchCampaign = function (text) {
  return (text === config.macros.pitchCampaign);
};

module.exports.isSendCrisisMessage = function (text) {
  return (text === config.macros.sendCrisisMessage);
};

module.exports.isSendInfoMessage = function (text) {
  return (text === config.macros.sendInfoMessage);
};

module.exports.isSubscriptionStatusLess = function (text) {
  return (text === config.macros.subscriptionStatusLess);
};

module.exports.isSubscriptionStatusStop = function (text) {
  return (text === config.macros.subscriptionStatusStop);
};

module.exports.isSupportRequested = function (text) {
  return (text === config.macros.supportRequested);
};
