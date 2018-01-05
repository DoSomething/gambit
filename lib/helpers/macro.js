'use strict';

const config = require('../../config/lib/helpers/macro');

function getMacroForKey(key) {
  return config.macros[key];
}

module.exports = {
  /**
   * Is given string a Rivescript macro?
   */
  isMacro: function isMacro(text) {
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

module.exports.isCampaignMenu = function (text) {
  return (text === config.macros.campaignMenu);
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
