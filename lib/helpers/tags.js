'use strict';

const mustache = require('mustache');
const queryString = require('query-string');
const config = require('../../config/lib/helpers/tags');

/**
 * @param {Object} linkConfig
 * @param {Object} req
 * @return {String}
 */
function getLink(linkConfig, req) {
  const userParams = module.exports.getUserLinkQueryParams(req);
  const broadcastParams = module.exports.getBroadcastLinkQueryParams(req);
  const query = Object.assign(linkConfig.query, userParams, broadcastParams);
  return `${linkConfig.url}?${queryString.stringify(query)}`;
}

/**
 * @param {Object} req
 * @return {Object}
 */
function getBroadcastLinkQueryParams(req) {
  const result = {};
  const paramName = 'broadcast_id';
  const broadcast = req.broadcast;
  if (req.broadcast) {
    result[paramName] = broadcast.id;
  } else if (req.conversation) {
    result[paramName] = req.conversation.lastReceivedBroadcastId;
  }
  return result;
}

/**
 * @param {Object} req
 * @return {Object}
 */
function getTags(req) {
  return {
    links: module.exports.getLinksTag(req),
    user: req.user ? module.exports.getUserTag(req.user) : {},
  };
}

/**
 * @param {Object} req
 * @return {Object}
 */
function getUserLinkQueryParams(req) {
  const user = req.user;
  if (!user) {
    return {};
  }
  return {
    user_id: user.id,
  };
}

/**
 * @param {Object} user
 * @return {Object}
 */
function getUserTag(user) {
  return {
    id: user.id,
    votingPlan: module.exports.getVotingPlanDescription(user),
  };
}

/**
 * @param {Object} user
 * @return {String}
 */
function getVotingPlanDescription(user) {
  const attendingWith = module.exports
    .getVotingPlanAttendingWithDescription(user.voting_plan_attending_with);
  const methodOfTransport = module.exports
    .getVotingPlanMethodOfTransportDescription(user.voting_plan_method_of_transport);
  return `${methodOfTransport} in the ${user.voting_plan_time_of_day} ${attendingWith}`;
}

/**
 * @param {String} value
 * @return {String}
 */
function getVotingPlanAttendingWithDescription(value) {
  if (value === 'co_workers') {
    return 'with your co-workers';
  }
  if (value === 'alone') {
    return 'by yourself';
  }
  return `with your ${value}`;
}

/**
 * @param {String} value
 * @return {String}
 */
function getVotingPlanMethodOfTransportDescription(value) {
  return value === 'public_transport' ? 'take public transport' : value;
}

/**
 * @param {Object} req
 * @return {Object}
 */
function getLinksTag(req) {
  return {
    pollingLocator: {
      find: module.exports.getLink(config.links.pollingLocator.find, req),
      share: module.exports.getLink(config.links.pollingLocator.share, req),
    },
  };
}

/**
 * @param {String} string
 * @param {Object} req
 * @return {String}
 */
function render(string, req) {
  return mustache.render(string, module.exports.getTags(req));
}

module.exports = {
  getBroadcastLinkQueryParams,
  getLink,
  getLinksTag,
  getTags,
  getUserLinkQueryParams,
  getUserTag,
  getVotingPlanAttendingWithDescription,
  getVotingPlanDescription,
  getVotingPlanMethodOfTransportDescription,
  render,
};
