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
  // TODO: Check for a broadcastable current topic if req.broadcast undefined.
  const broadcast = req.broadcast;
  if (!broadcast) {
    return {};
  }
  return {
    broadcast_id: broadcast.id,
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
 * @param {Object} req
 * @return {Object}
 */
function getLinks(req) {
  return {
    pollingLocator: {
      find: getLink(config.links.pollingLocator.find, req),
      share: getLink(config.links.pollingLocator.share, req),
    },
  };
}

module.exports = {
  getBroadcastLinkQueryParams,
  getUserLinkQueryParams,
  getVarsForTags: function getVarsForTags(req) {
    const vars = {};
    vars[config.tags.links] = getLinks(req);
    vars[config.tags.user] = req.user || {};
    return vars;
  },
  render: function render(string, req) {
    return mustache.render(string, module.exports.getVarsForTags(req));
  },
};
