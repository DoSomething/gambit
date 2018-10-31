'use strict';

const mustache = require('mustache');
const queryString = require('query-string');
const logger = require('../logger');
const config = require('../../config/lib/helpers/tags');
const userConfig = require('../../config/lib/helpers/user');

const votingPlanVars = config.user.votingPlan.vars;

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
    votingPlan: module.exports.getVotingPlan(user),
  };
}

/**
 * @param {Object} user
 * @return {String}
 */
function getVotingPlan(user) {
  const vars = {
    attendingWith: module.exports.getVotingPlanAttendingWith(user),
    methodOfTransport: module.exports.getVotingPlanMethodOfTransport(user),
    timeOfDay: module.exports.getVotingPlanTimeOfDay(user),
  };
  const description = mustache.render(config.user.votingPlan.template, vars);
  const result = Object.assign({ description }, vars);
  logger.debug('getVotingPlan', { result });
  return result;
}

/**
 * @param {Object} user
 * @return {String}
 */
function getVotingPlanAttendingWith(user) {
  const fieldName = userConfig.fields.votingPlanAttendingWith.name;
  const fieldValue = user[fieldName];
  return votingPlanVars.attendingWith[fieldValue];
}

/**
 * @param {Object} user
 * @return {String}
 */
function getVotingPlanMethodOfTransport(user) {
  const fieldName = userConfig.fields.votingPlanMethodOfTransport.name;
  const fieldValue = user[fieldName];
  return votingPlanVars.methodOfTransport[fieldValue];
}

/**
 * @param {Object} user
 * @return {String}
 */
function getVotingPlanTimeOfDay(user) {
  const fieldName = userConfig.fields.votingPlanTimeOfDay.name;
  const fieldValue = user[fieldName];
  return votingPlanVars.timeOfDay[fieldValue];
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
  getVotingPlan,
  getVotingPlanAttendingWith,
  getVotingPlanMethodOfTransport,
  getVotingPlanTimeOfDay,
  render,
};
