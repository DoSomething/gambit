'use strict';

const underscore = require('underscore');
const logger = require('../logger');
const northstar = require('../northstar');
const rogue = require('../rogue');
const helpers = require('../helpers');
const statuses = require('./subscription').statuses;
const config = require('../../config/lib/helpers/user');

const rogueClientConfig = rogue.getConfig();
const votingPlanPostConfig = config.posts.votingPlan;

/**
 * @param {Object} user
 * @param {Object} args
 * @return {Promise}
 */
async function createSignup(user, args) {
  const payload = {
    northstar_id: user.id,
    campaign_id: args.campaignId,
    campaign_run_id: args.campaignRunId,
    source: args.source,
    details: args.details,
  };
  logger.debug('rogue.createSignup post', { payload });
  return rogue.createSignup(payload);
}

/**
 * @param {Object} user
 * @param {Object} args
 * @return {Promise}
 */
async function createPhotoPost(user, args) {
  const payload = {
    northstar_id: user.id,
    campaign_id: args.campaignId,
    campaign_run_id: args.campaignRunId,
    quantity: args.quantity,
    source: args.source,
    text: args.text,
    type: config.posts.photo.type,
  };
  if (args.whyParticipated) {
    payload.why_participated = args.whyParticipated;
  }
  payload[rogueClientConfig.photoPostCreation.fileProperty] = args.file;
  logger.debug('createPhotoPost', { userId: user.id, campaignId: args.campaignId });
  return rogue.createPost(payload);
}

/**
 * @param {Object} user
 * @param {Object} args
 * @return {Promise}
 */
async function createTextPost(user, args) {
  const payload = {
    northstar_id: user.id,
    campaign_id: args.campaignId,
    campaign_run_id: args.campaignRunId,
    source: args.source,
    text: args.text,
    type: config.posts.text.type,
  };
  logger.debug('rogue.createPost post', { payload });
  return rogue.createPost(payload);
}

/**
 * @param {Object} user
 * @param {String} source
 * @return {Promise}
 */
function createVotingPlan(user, source) {
  const text = JSON.stringify(module.exports.getVotingPlanValues(user));
  const payload = {
    campaign_id: votingPlanPostConfig.campaignId,
    northstar_id: user.id,
    source,
    text,
    type: votingPlanPostConfig.type,
  };
  logger.debug('rogue.createPost', { payload });
  return rogue.createPost(payload);
}

/**
 * @param {Object} user
 * @param {String} source
 * @return {Promise}
 */
async function fetchOrCreateVotingPlan(user, source) {
  const userId = user.id;
  const votingPlan = await module.exports.fetchVotingPlan(user);
  if (votingPlan) {
    logger.debug('voting plan exists', { userId });
    return votingPlan;
  }
  logger.debug('creating voting plan', { userId });
  return module.exports.createVotingPlan(user, source);
}

/**
 * @param {Object} user
 * @param {Object} args
 * @return {Promise}
 */
async function fetchOrCreateSignup(user, args) {
  const userId = user.id;
  const campaignId = args.campaignId;
  if (!campaignId) {
    throw new Error('fetchOrCreateSignup missing campaignId param');
  }
  const signup = await module.exports.fetchSignup(user, campaignId);
  if (signup) {
    logger.debug('signup exists', { signup });
    return signup;
  }
  logger.debug('creating signup', { userId, campaignId });
  return module.exports.createSignup(user, args);
}

/**
 * @param {Object} user
 * @param {Number} campaignId
 * @return {Promise}
 */
async function fetchSignup(user, campaignId) {
  const res = await rogue.fetchSignups(module.exports.getFetchSignupsQuery(user.id, campaignId));
  return res.data && res.data[0] ? res.data[0] : null;
}

/**
 * @param {String} userId
 * @param {Number} campaignId
 * @return {Object}
 */
function getFetchSignupsQuery(userId, campaignId) {
  const query = {};
  query['filter[northstar_id]'] = userId;
  query['filter[campaign_id]'] = campaignId;
  return query;
}

/**
 * @param {String} userId
 * @return {Object}
 */
function getFetchVotingPlanQuery(userId) {
  const postTypeQuery = { 'filter[type]': votingPlanPostConfig.type };
  return Object.assign(module.exports
    .getFetchSignupsQuery(userId, votingPlanPostConfig.campaignId), postTypeQuery);
}

/**
 * @param {Object} user
 * @return {Object}
 */
function getVotingPlanValues(user) {
  return {
    attending_with: user[config.fields.votingPlanAttendingWith.name],
    method_of_transport: user[config.fields.votingPlanMethodOfTransport.name],
    time_of_day: user[config.fields.votingPlanTimeOfDay.name],
  };
}

/**
 * @param {Object} user
 * @return {Promise}
 */
async function fetchVotingPlan(user) {
  const res = await rogue.fetchPosts(module.exports.getFetchVotingPlanQuery(user.id));
  return res.data && res.data[0] ? res.data[0] : null;
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
    const user = await northstar.updateUser(req.user.id, payload);
    if (helpers.macro.isCompletedVotingPlan(req.macro)) {
      const votingPlan = await module.exports.fetchOrCreateVotingPlan(user, req.platform);
      logger.debug('votingPlan', { votingPlan }, req);
    }
    return user;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createPhotoPost,
  createSignup,
  createTextPost,
  createVotingPlan,
  fetchOrCreateSignup,
  fetchOrCreateVotingPlan,
  fetchSignup,
  fetchVotingPlan,
  getFetchSignupsQuery,
  getFetchVotingPlanQuery,
  getVotingPlanValues,
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
