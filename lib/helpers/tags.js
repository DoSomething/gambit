'use strict';

const mustache = require('mustache');

const config = require('../../config/lib/helpers/tags');

/**
 * @param {Object} linkConfig
 * @return {String}
 */
function renderLink(linkConfig) {
  return linkConfig.url;
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
  /**
   * Mustache rendering
   */
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
