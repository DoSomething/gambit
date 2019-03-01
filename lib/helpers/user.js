'use strict';

const underscore = require('underscore');
const logger = require('../logger');
const northstar = require('../northstar');
const gateway = require('../gateway');
const helpers = require('../helpers');
const statuses = require('./subscription').statuses;
const config = require('../../config/lib/helpers/user');

const gatewayClientConfig = gateway.getConfig();
const votingPlanPostConfig = config.posts.votingPlan;

/**
 * @param {Object} user
 * @param {Object} campaign
 * @param {String} signupSource
 * @param {String} signupSourceDetails
 * @return {Promise}
 */
async function createSignup(user, campaign, signupSource, signupSourceDetails) {
  const payload = {
    northstar_id: user.id,
    campaign_id: campaign.id,
    source: signupSource,
    details: signupSourceDetails,
  };
  logger.debug('created signup', { payload });
  return gateway.createSignup(payload);
}

/**
 * Creates a Rogue post with type photo.
 * @see https://github.com/DoSomething/rogue/blob/master/docs/endpoints/posts.md#create-a-post
 *
 * @param {Object} user
 * @param {Object} campaign
 * @param {String} photoPostSource
 * @param {Object} photoPostValues
 * @return {Promise}
 */
async function createPhotoPost({ userId, campaignId, actionId, photoPostSource, photoPostValues }) {
  const payload = {
    northstar_id: userId,
    quantity: photoPostValues.quantity,
    source: photoPostSource,
    text: photoPostValues.caption,
    type: config.posts.photo.type,
  };
  if (photoPostValues.whyParticipated) {
    payload.why_participated = photoPostValues.whyParticipated;
  }
  payload[gatewayClientConfig.photoPostCreation.fileProperty] = await helpers.util
    .fetchImageFileFromUrl(photoPostValues.url);

  if (actionId) {
    payload.action_id = actionId;
  } else {
    /**
     * campaign_id, action
     * Are not required when sending action_id
     * @see https://github.com/DoSomething/rogue/pull/837
     */
    payload.campaign_id = campaignId;
    payload.action = 'default';
  }
  logger.debug('createPhotoPost', { payload });

  return gateway.createPost(payload);
}

/**
 * Creates a Rogue post with type text.
 * @see https://github.com/DoSomething/rogue/blob/master/docs/endpoints/posts.md#create-a-post
 *
 * @param {Object} user
 * @param {Object} campaign
 * @param {String} textPostSource
 * @param {String} textPostText
 * @return {Promise}
 */
async function createTextPost({ userId, campaignId, actionId, textPostSource, textPostText }) {
  const payload = {
    northstar_id: userId,
    source: textPostSource,
    text: textPostText,
    type: config.posts.text.type,
  };

  if (actionId) {
    /**
     * WARNING
     * Posts for topics in Contentful will use the "default"
     * backfilled action in Rogue if the "Campaign Action Id" field is left empty
     * by content editors.
     *
     * It's possible for a content editor to use a campaign that has a default action
     * of type photo, for example, in a text topic. If this is done, the
     * "Campaign Action Id" field of the text topic MUST be updated with the appropriate
     * text action id. Otherwise, Rogue won't find the action due to a mismatch of type
     * and will respond with an error when creating the post.
     */
    payload.action_id = actionId;
  } else {
    /**
     * campaign_id, action
     * Are not required when sending action_id
     * @see https://github.com/DoSomething/rogue/pull/837
     */
    payload.campaign_id = campaignId;
    payload.action = 'default';
  }
  logger.debug('createTextPost', { payload });

  return gateway.createPost(payload);
}

/**
 * @param {Object} user
 * @param {String} votingPlanSource
 * @return {Promise}
 */
function createVotingPlan(user, votingPlanSource) {
  const payload = {
    campaign_id: votingPlanPostConfig.campaignId,
    northstar_id: user.id,
    source: votingPlanSource,
    text: JSON.stringify(module.exports.getVotingPlanValues(user)),
    type: votingPlanPostConfig.type,
  };
  logger.debug('createVotingPlan', { payload });
  return gateway.createPost(payload);
}

/**
 * @param {Object} user
 * @param {String} votingPlanSource
 * @return {Promise}
 */
async function fetchOrCreateVotingPlan(user, votingPlanSource) {
  const userId = user.id;
  const votingPlan = await module.exports.fetchVotingPlan(user);
  if (votingPlan) {
    logger.debug('voting plan exists', { userId });
    return votingPlan;
  }
  logger.debug('creating voting plan', { userId });
  return module.exports.createVotingPlan(user, votingPlanSource);
}

/**
 * @param {Object} user
 * @param {Object} campaign
 * @param {String} signupSource
 * @param {String} signupSourceDetails
 * @return {Promise}
 */
async function fetchOrCreateSignup(user, campaign, signupSource, signupSourceDetails) {
  const signup = await module.exports.fetchSignup(user, campaign);
  if (signup) {
    logger.debug('signup exists', { signup });
    return signup;
  }
  logger.debug('creating signup', { userId: user.id, campaignId: campaign.id });
  return module.exports.createSignup(user, campaign, signupSource, signupSourceDetails);
}

/**
 * @param {Object} user
 * @param {Object} campaign
 * @return {Promise}
 */
async function fetchSignup(user, campaign) {
  const res = await gateway
    .fetchSignups(module.exports.getFetchSignupsQuery(user.id, campaign.id));
  return res.data && res.data[0] ? res.data[0] : null;
}

/**
 * @param {String} userId
 * @param {Number} campaignId
 * @return {Object}
 */
function getFetchSignupsQuery(userId, campaignId) {
  return {
    'filter[northstar_id]': userId,
    'filter[campaign_id]': campaignId,
  };
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
  const res = await gateway.fetchPosts(module.exports.getFetchVotingPlanQuery(user.id));
  return res.data && res.data[0] ? res.data[0] : null;
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
    // TODO: If we are re-throwing, why catch at all?
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
  updateByMemberMessageReq,
};
