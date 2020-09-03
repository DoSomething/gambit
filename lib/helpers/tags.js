'use strict';

const mustache = require('mustache');
const queryString = require('query-string');

const graphql = require('../graphql');
const config = require('../../config/lib/helpers/tags');
const userConfig = require('../../config/lib/helpers/user');

const votingPlanVars = config.user.votingPlan.vars;

// Disable all escaping, to avoid requiring editors to use triple brackets for the links tag.
// @see https://www.npmjs.com/package/mustache#variables
mustache.escape = text => text;

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
function getBroadcastTag(req) {
  let broadcastId;
  if (req.broadcast) {
    broadcastId = req.broadcast.id;
  } else if (req.conversation) {
    broadcastId = req.conversation.lastReceivedBroadcastId;
  }
  return broadcastId ? { id: broadcastId } : {};
}

/**
 * @param {Object} req
 * @return {Object}
 */
async function getTags(req) {
  return {
    broadcast: module.exports.getBroadcastTag(req),
    links: module.exports.getLinksTag(req),
    topic: req.topic ? req.topic : {},
    user: req.user ? await module.exports.getUserTag(req.user) : {},
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
async function getUserTag(user) {
  try {
    const stateAbbreviation = user.addr_state;
    const locationVotingInformation = await graphql
      .fetchVotingInformationByLocation(`US-${stateAbbreviation}`);

    return Object.assign({
      id: user.id,
      addrState: stateAbbreviation,
      votingPlan: module.exports.getVotingPlan(user),
    }, locationVotingInformation);    
  } catch (error) {
    throw error;
  }
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
  return Object.assign({ description }, vars);
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
async function render(string, req) {
  return mustache.render(string, await module.exports.getTags(req));
}

module.exports = {
  getBroadcastLinkQueryParams,
  getBroadcastTag,
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
