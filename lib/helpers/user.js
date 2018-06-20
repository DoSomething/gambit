'use strict';

const crypto = require('crypto');
const underscore = require('underscore');

const logger = require('../logger');
const northstar = require('../northstar');
const macro = require('./macro');
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
   * @param {object} user
   * @param {string} rivescriptReplyText
   * @return {string}
   */
  getSubscriptionStatusUpdate: function getSubscriptionStatusUpdate(user, rivescriptReplyText) {
    const activeStatusValue = statuses.active();
    // Note: We're checking SMS status for Slack users. If we ever integrate with another platform,
    // we'll want to store separate platform subscription values on a Northstar User.
    const currentSubscriptionStatus = user.sms_status;

    /**
     * Check if rivescriptReplyText is a subscriptionStatus macro.
     */
    if (macro.isSubscriptionStatusActive(rivescriptReplyText)) {
      return activeStatusValue;
    }

    if (macro.isSubscriptionStatusResubscribed(rivescriptReplyText)) {
      return activeStatusValue;
    }

    if (macro.isSubscriptionStatusStop(rivescriptReplyText)) {
      return statuses.stop();
    }

    if (macro.isSubscriptionStatusLess(rivescriptReplyText)) {
      return statuses.less();
    }

    // TODO: Once we deprecate keywords, check if rivescriptReplyText is a changeTopic macro,
    // and return active status value.

    // If a macro hasn't been triggered and we don't have a subscription status saved for this
    // user, assume they are now active.
    // TODO: Do not assume that, and send a new template prompting user to confirm subscription by
    // replying with a join keyword.
    // @see https://www.pivotaltracker.com/story/show/158416129
    if (!currentSubscriptionStatus) {
      return activeStatusValue;
    }

    // If we've made it this far, no need to update user's subscription status.
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

  setPendingSubscriptionStatusForUserId,
};
