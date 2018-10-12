'use strict';

const underscore = require('underscore');

const logger = require('../logger');
const northstar = require('../northstar');
const rogue = require('../rogue');
const helpers = require('../helpers');
const statuses = require('./subscription').statuses;
const config = require('../../config/lib/helpers/user');

/**
 * @param {Object} user
 * @return {Promise}
 */
function createVotingPlan(user, source) {
  const votingPlan = {
    attending_with: user.voting_plan_attending_with,
    method_of_transport: user.voting_plan_method_of_transport,
    time_of_day: user.voting_plan_time_of_day,
  };
  const votingPlanPostConfig = config.posts.votingPlan;
  const payload = {
    northstar_id: user.id,
    type: votingPlanPostConfig.type,
    text: JSON.stringify(votingPlan),
    campaign_id: votingPlanPostConfig.campaignId,
    source,
  };
  logger.debug('rogue.createPost', { payload });
  // TODO: If text post already exists for our campaignId, update it instead of creating a new one.
  return rogue.createPost(payload);
}

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
async function updateByMemberMessageReq(req) {
  const payload = {};
  try {
    underscore.extend(payload, module.exports.getDefaultUpdatePayloadFromReq(req));
    underscore.extend(payload, helpers.macro.getProfileUpdate(req.macro));
    if (req.platformUserAddress && !helpers.user.hasAddress(req.user)) {
      underscore.extend(payload, req.platformUserAddress);
    }
  } catch (err) {
    return Promise.reject(err);
  }

  const user = await northstar.updateUser(req.user.id, payload);
  if (helpers.macro.isCompletedVotingPlan(req.macro)) {
    await module.exports.createVotingPlan(user, req.platform);
  }
  return user;
}

module.exports = {
  createVotingPlan,
  unauthenticatedFetchById(userId) {
    return northstar.unauthenticatedFetchUserById(userId);
  },
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
    const status = user.sms_status;
    /**
     * Seems to me that having a sms_status of undefined is an edge case. Because of it,
     * I think we are safe treating them as unsubscribed users.
     * TODO: To understand the bigger scale impact we should get a total count of users
     * w/ undefined as the sms_status value.
     */
    if (
      status === undefined ||
      status === statuses.stop() ||
      status === statuses.undeliverable()) {
      return false;
    }
    return true;
  },
  setPendingSubscriptionStatusForUserId,
  updateByMemberMessageReq,
};
