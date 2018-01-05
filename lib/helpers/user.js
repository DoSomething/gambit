'use strict';

const macro = require('./macro');
const statuses = require('./subscription').statuses;

module.exports = {
  /**
   * @param {object} user
   * @return {boolean}
   */
  hasAddress: function hasAddress(user) {
    if (user.addr_city && user.addr_state && user.addr_zip && user.country) {
      return true;
    }
    return false;
  },

  /**
   * @param {object} user
   * @param {string} rivescriptReplyText
   * @return {string}
   */
  getSubscriptionStatusUpdate: function getSubscriptionStatusUpdate(user, rivescriptReplyText) {
    const stopValue = statuses.stop();

    if (macro.isSubscriptionStatusStop(rivescriptReplyText)) {
      return stopValue;
    }

    if (macro.isSubscriptionStatusLess(rivescriptReplyText)) {
      return statuses.less();
    }

    // Note: We're setting SMS status for Slack users -- if we ever integrate with another platform,
    // we'll want to store separate platform subscription values on a Northstar User.
    const currentStatus = user.sms_status;
    const undeliverableValue = statuses.undeliverable();
    if (currentStatus === stopValue || currentStatus === undeliverableValue || !currentStatus) {
      return statuses.active();
    }

    // Nothing to update.
    return null;
  },
};
