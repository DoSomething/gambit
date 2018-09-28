'use strict';

const crypto = require('crypto');
const underscore = require('underscore');

const logger = require('../logger');
const northstar = require('../northstar');
const helpers = require('../helpers');
const statuses = require('./subscription').statuses;
const config = require('../../config/lib/helpers/user');

/**
 * @param {String} userId
 * @return {Promise}
 */
function setPendingSubscriptionStatusForUserId(userId) {
  logger.debug('setPendingSubscriptionStatusForUserId', { userId });
  return northstar.updateUser(userId, { sms_status: statuses.pending() });
}

/**
 * @param {Object} req
 * @return {Promise}
 */
function updateByMemberMessageReq(req) {
  const payload = module.exports.getDefaultUpdatePayloadFromReq(req);
  const subscriptionStatusUpdate = module.exports.parseSubscriptionStatusMacro(req.macro);
  if (subscriptionStatusUpdate) {
    // Note: if we ever support conversations with additional platforms in production, we'd want to
    // save separate subscription status values per platform on our user.
    underscore.extend(payload, { sms_status: subscriptionStatusUpdate });
  }
  if (req.platformUserAddress && !helpers.user.hasAddress(req.user)) {
    underscore.extend(payload, req.platformUserAddress);
    logger.debug('update address', { data: req.userUpdateData });
  }
  return northstar.updateUser(req.userId, payload);
}

module.exports = {
  fetchById: function fetchById(userId) {
    return northstar.fetchUserById(userId);
  },
  fetchByMobile: function fetchByMobile(mobileNumber) {
    return northstar.fetchUserByMobile(mobileNumber);
  },
  /**
   * fetchFromReq - The conversation's `userId` has precedence over `platformUserId`
   *
   * @param  {Object} req
   * @return {Promise}
   */
  fetchFromReq: function fetchFromReq(req) {
    if (req.userId) {
      return this.fetchById(req.userId);
    }
    return this.fetchByMobile(req.platformUserId);
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
    // Currently only support creating new Users via SMS.
    const mobile = req.platformUserId;
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
      sms_paused: req.conversation.isSupportTopic(),
    };
  },

  /**
   * getUndeliverableStatusUpdatePayload
   *
   * @return {Object}
   */
  getUndeliverableStatusUpdatePayload: function getUndeliverableStatusUpdatePayload() {
    return {
      sms_status: statuses.undeliverable(),
    };
  },

  /**
   * @param {String} macro
   * @return {String}
   */
  parseSubscriptionStatusMacro: function parseSubscriptionStatusMacro(macro) {
    const activeStatusValue = statuses.active();
    if (helpers.macro.isSubscriptionStatusActive(macro)) {
      return activeStatusValue;
    }
    if (helpers.macro.isSubscriptionStatusResubscribed(macro)) {
      return activeStatusValue;
    }
    if (helpers.macro.isSubscriptionStatusStop(macro)) {
      return statuses.stop();
    }
    if (helpers.macro.isSubscriptionStatusLess(macro)) {
      return statuses.less();
    }
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
    // @see note in this.parseSubscriptionStatusMacro for TODOS if we ever support other platforms.
    const status = user.sms_status;
    if (status === statuses.stop() || status === statuses.undeliverable()) {
      return false;
    }

    // TODO: Confirm if status is undefined, should we consider the User a subscriber? Assuming yes.
    return true;
  },
  setPendingSubscriptionStatusForUserId,
  updateByMemberMessageReq,
};
