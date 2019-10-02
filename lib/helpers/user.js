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
 * @param {Object} props - The properties used to create the photo post
 * @param {String} props.userId
 * @param {Number} props.actionId
 * @param {String} props.photoPostSource
 * @param {Object} props.photoPostValues
 * @param {String} props.location ISO-3166-2 State code
 * @return {Promise}
 */
async function createPhotoPost({ userId, actionId, photoPostSource, photoPostValues, location }) {
  const payload = {
    northstar_id: userId,
    action_id: actionId,
    quantity: photoPostValues.quantity,
    source: photoPostSource,
    text: photoPostValues.caption,
    type: config.posts.photo.type,
  };
  if (location) {
    payload.location = location;
  }
  if (photoPostValues.whyParticipated) {
    payload.why_participated = photoPostValues.whyParticipated;
  }
  // log payload before fetching image.
  logger.debug('createPhotoPost payload', { payload });
  payload[gatewayClientConfig.photoPostCreation.fileProperty] = await helpers.util
    .fetchImageFileFromUrl(photoPostValues.url);

  return gateway.createPost(payload);
}

/**
 * Creates a Rogue post with type text.
 * @see https://github.com/DoSomething/rogue/blob/master/docs/endpoints/posts.md#create-a-post
 *
 * @param {Object} props - The properties used to create the text post
 * @param {String} props.userId
 * @param {Number} props.actionId
 * @param {String} props.textPostSource
 * @param {String} props.textPostText
 * @param {String} props.location ISO-3166-2 State code
 * @return {Promise}
 */
async function createTextPost({ userId, actionId, textPostSource, textPostText, location }) {
  const payload = {
    northstar_id: userId,
    action_id: actionId,
    source: textPostSource,
    text: textPostText,
    type: config.posts.text.type,
  };
  if (location) {
    payload.location = location;
  }
  logger.debug('createTextPost payload', { payload });

  return gateway.createPost(payload);
}

/**
 * @param {Object} user
 * @param {String} votingPlanSource
 * @param {String} location ISO-3166-2 State code
 * @return {Promise}
 */
function createVotingPlan(user, votingPlanSource, location) {
  const payload = {
    campaign_id: votingPlanPostConfig.campaignId,
    northstar_id: user.id,
    source: votingPlanSource,
    text: JSON.stringify(module.exports.getVotingPlanValues(user)),
    type: votingPlanPostConfig.type,
  };
  if (location) {
    payload.location = location;
  }
  logger.debug('createVotingPlan', { payload });
  return gateway.createPost(payload);
}

/**
 * @param {Object} user
 * @param {String} votingPlanSource
 * @param {String} location ISO-3166-2 State code
 * @return {Promise}
 */
async function fetchOrCreateVotingPlan(user, votingPlanSource, location) {
  const userId = user.id;
  const votingPlan = await module.exports.fetchVotingPlan(user);
  if (votingPlan) {
    logger.debug('voting plan exists', { userId });
    return votingPlan;
  }
  logger.debug('creating voting plan', { userId });
  return module.exports.createVotingPlan(user, votingPlanSource, location);
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
  const payload = module.exports.getDefaultUpdatePayloadFromReq(req);
  // If we need to update a member's property due to them triggering a macro,
  // we add the field and value here
  underscore.extend(payload, helpers.macro.getProfileUpdate(req.macro));
  // Backfill the member's address reported by Twilio if the member does not have
  // have an address in their profile
  if (req.platformUserAddress && !helpers.user.hasAddress(req.user)) {
    underscore.extend(payload, req.platformUserAddress);
  }
  const user = await northstar.updateUser(req.user.id, payload);
  logger.debug('updated user', { id: user.id }, req);

  // This voting plan logic should be refactored/moved.
  // TODO: Move this side effect out of this method.
  if (helpers.macro.isCompletedVotingPlan(req.macro)) {
    const votingPlan = await module.exports
      .fetchOrCreateVotingPlan(user, req.platform, req.platformUserStateISOCode);
    logger.debug('votingPlan', { votingPlan }, req);
  }
  return user;
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
   * By default we update the last_messaged_at and if the conversation was switched to support
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
  hasAddress: function hasAddress(user) {
    if (user.addr_city && user.addr_state && user.addr_zip && user.country) {
      return true;
    }
    return false;
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
