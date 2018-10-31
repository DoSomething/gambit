'use strict';

const mustache = require('mustache');
const queryString = require('query-string');
const config = require('../../config/lib/helpers/tags');

/**
 * @param {Object} linkConfig
 * @return {String}
 */
function getLink(linkConfig, req) {
  const query = Object.assign(linkConfig.query, module.exports.getLinkQueryParams(req));
  return `${linkConfig.url}?${queryString.stringify(query)}`;
}

/**
 * @param {Object} req
 * @return {Object}
 */
function getLinkQueryParams(req) {
  const broadcast = req.broadcast;
  const user = req.user;
  return {
    broadcast_id: broadcast && broadcast.id ? broadcast.id : null,
    user_id: user && user.id ? user.id : null,
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
  getLinkQueryParams,
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
