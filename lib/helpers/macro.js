'use strict';

const config = require('../../config/lib/helpers/macro');

function getMacroForKey(key) {
  return config.macros[key];
}

module.exports = {
  /**
   * @param {string} macroName
   * @return {string}
   */
  getReply: function getReply(macroName) {
    return config.replies[macroName];
  },
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
