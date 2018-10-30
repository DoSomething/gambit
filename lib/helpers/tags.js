'use strict';

const mustache = require('mustache');
const queryString = require('query-string');
const config = require('../../config/lib/helpers/tags');

/**
 * @param {Object} linkConfig
 * @return {String}
 */
function renderLink(linkConfig, req) {
  return `${linkConfig.url}?${module.exports.renderQueryString(linkConfig.query, req)}`;
}

/**
 * @param {Object} query
 * @param {Object} req
 * @return {String}
 */
function renderQueryString(query, req) {
  return queryString.stringify(Object.assign(query, module.exports.getUserIdQueryParam(req)));
}

/**
 * @param {Object} req
 * @return {Object}
 */
function getUserIdQueryParam(req) {
  return {
    user_id: req.user && req.user.id ? req.user.id : null,
  };
}

/**
 * @param {Object} req
 * @return {Object}
 */
function getLinks(req) {
  return {
    pollingLocator: {
      find: renderLink(config.links.pollingLocator.find, req),
      share: renderLink(config.links.pollingLocator.share, req),
    },
  };
}

module.exports = {
  getUserIdQueryParam,
  getVarsForTags: function getVarsForTags(req) {
    const vars = {};
    vars[config.tags.links] = getLinks(req);
    vars[config.tags.user] = req.user || {};
    return vars;
  },
  render: function render(string, req) {
    return mustache.render(string, module.exports.getVarsForTags(req));
  },
  renderQueryString,
};
