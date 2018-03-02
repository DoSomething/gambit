'use strict';

const crypto = require('crypto');
const underscore = require('underscore');
const northstar = require('../northstar');
const macro = require('./macro');
const statuses = require('./subscription').statuses;
const config = require('../../config/lib/helpers/user');

module.exports = {
  fetchById: function fetchById(userId) {
    return northstar.fetchUserById(userId);
  },
  fetchByMobile: function fetchByMobile(mobileNumber) {
    return northstar.fetchUserByMobile(mobileNumber);
  },
  fetchFromReq: function fetchFromReq(req) {
    if (req.userMobile) {
      return this.fetchByMobile(req.userMobile);
    }
    return this.fetchById(req.userId);
  },
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
  getCreatePayloadFromReq: function getCreatePayloadFromReq(req) {
    const mobile = req.userMobile;
    const data = {
      source: req.platform,
      mobile,
      password: this.generatePassword(mobile),
      sms_status: statuses.active(),
      sms_paused: false,
    };
    underscore.extend(data, req.platformUserAddress);
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

    const activeStatus = statuses.active();
    // Note: We're checking SMS status for Slack users. If we ever integrate with another platform,
    // we'll want to store separate platform subscription values on a Northstar User.
    if (!user.sms_status) {
      return activeStatus;
    }
    // If this user is currently not a subscriber, and now we're hearing from them
    // (with a non subscription status macro)
    if (!this.isSubscriber(user)) {
      // Their subscription status should be set to active.
      return activeStatus;
    }

    // Nothing to update.
    return null;
  },

  /**
   * @param {object} user
   * @return {boolean}
   */
  isPaused(user) {
    return user.sms_paused;
  },

  /**
   * @param {object} user
   * @return {boolean}
   */
  isSubscriber(user) {
    // @see note in this.getSubscriptionStatusUpdate for TODOS if we ever support other platforms.
    const status = user.sms_status;
    if (status === statuses.stop() || status === statuses.undeliverable()) {
      return false;
    }

    // TODO: Confirm if status is undefined, should we consider the User a subscriber? Assuming yes.
    return true;
  },
};
