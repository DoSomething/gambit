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
  customUrlQueryValueField: function getCustomUrlQueryValueField(fieldName, value) {
    const suffix = config.customUrl.queryValue.fieldSuffix;
    return `${fieldName}${suffix}${value}`;
  },
  getCustomUrlQueryParamValue: function getCustomUrlQueryParamValue(req = {}) {
    const fields = config.customUrl.queryValue.fields;
    const result = [];
    const user = module.exports.customUrlQueryValueField(fields.userId, req.userId);
    result.push(user);

    if (req.campaign && req.campaign.currentCampaignRun) {
      const campaignRunId = req.campaign.currentCampaignRun.id;
      const campaign = module.exports.customUrlQueryValueField(fields.campaignRunId, campaignRunId);
      result.push(campaign);
    }

    const separator = config.customUrl.queryValue.separator;
    return result.join(separator);
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
