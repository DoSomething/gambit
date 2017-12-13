'use strict';

const mustache = require('mustache');

const config = require('../../config/lib/helpers/tags');

module.exports = {
  getCustomUrl: function getCustomUrl(req) {
    const queryParamValue = module.exports.getCustomUrlQueryParamValue(req);
    const queryString = module.exports.getCustomUrlQueryStringWithValue(queryParamValue);
    const result = `${config.customUrl.url}?${queryString}`;

    return result;
  },
  getCustomUrlQueryStringWithValue: function getCustomUrlQueryStringWithValue(queryParamValue) {
    const result = `${config.customUrl.queryParamName}=${queryParamValue}`;
    return result;
  },
  getCustomUrlQueryParamValue: function getCustomUrlQueryParamValue(req = {}) {
    const result = [`user:${req.userId}`];
    if (req.campaign && req.campaign.currentCampaignRun) {
      result.push(`campaign:${req.campaign.currentCampaignRun.id}`);
    }
    return result.join(',');
  },
  getVars: function getVars(req) {
    const vars = {};
    vars[config.tags.customUrl] = module.exports.getCustomUrl(req);
    return vars;
  },
  render: function render(string, req) {
    return mustache.render(string, module.exports.getVars(req));
  },
};
