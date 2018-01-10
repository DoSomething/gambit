'use strict';

const crypto = require('crypto');
const underscore = require('underscore');
const macro = require('./macro');
const statuses = require('./subscription').statuses;
const config = require('../../config/lib/helpers/user');

module.exports = {
  /**
   * @param {string} stringToEncrypt
   * @return {string}
   */
  generatePassword: function generatePassword(stringToEncrypt) {
    const opts = config.createOptions;
    return crypto
      .createHmac(opts.passwordAlgorithm, opts.passwordKey)
      .update(stringToEncrypt)
      .digest('hex')
      .substring(0, opts.passwordLength);
  },

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
   * @param {object} req
   * @return {object}
   */
  getDefaultCreatePayloadFromReq: function getDefaultCreatePayloadFromReq(req) {
    const data = this.getDefaultUpdatePayloadFromReq(req);
    underscore.extend(data, req.platformUserAddress);
    data.source = req.platform;
    data.mobile = req.platformUserId;
    data.password = this.generatePassword(data.mobile);
    // TODO: Edge-case where a new user is created from subscriptionStatus macro.
    data.sms_status = statuses.active();

    return data;
  },

  /**
   * @param {object} req
   * @return {object}
   */
  getDefaultUpdatePayloadFromReq: function getDefaultUpdatePayloadFromReq(req) {
    return {
      last_messaged_at: req.inboundMessage.createdAt.toISOString(),
      sms_paused: req.conversation.paused,
    };
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
