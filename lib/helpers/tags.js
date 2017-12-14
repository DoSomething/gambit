'use strict';

const mustache = require('mustache');

const config = require('../../config/lib/helpers/tags');

module.exports = {
  /**
   * Mustache rendering
   */
  getVarsForTags: function getVarsForTags(req) {
    const vars = {};
    vars[config.tags.customUrl] = module.exports.getCustomUrl(req);
    return vars;
  },
  render: function render(string, req) {
    return mustache.render(string, module.exports.getVarsForTags(req));
  },

  /**
   * Custom URL tag
   */
  getCustomUrl: function getCustomUrl(req) {
    const urlConfig = config.customUrl;
    const queryParamValue = module.exports.getCustomUrlQueryParamValue(req);
    const result = `${urlConfig.url}?${urlConfig.queryParamName}=${queryParamValue}`;

    return result;
  },
  getCustomUrlQueryParamValue: function getCustomUrlQueryParamValue(req) {
    const data = [
      module.exports.getUserIdCustomUrlQueryValueField(req),
      module.exports.getCampaignRunIdCustomUrlQueryValueField(req),
    ];
    return module.exports.joinCustomUrlQueryValueFields(data);
  },
  formatCustomUrlQueryValueField: function getCustomUrlQueryValueField(fieldName, value) {
    const suffix = config.customUrl.queryValue.fieldSuffix;
    return `${fieldName}${suffix}${value}`;
  },
  getUserIdCustomUrlQueryValueField: function getUserIdCustomUrlQueryValueField(req) {
    const fieldName = config.customUrl.queryValue.fields.userId;
    // Without a User ID, we'd lose the ability to associate the current req User to the URL, so
    // don't check for existence of req.user.
    return module.exports.formatCustomUrlQueryValueField(fieldName, req.user.id);
  },
  getCampaignRunIdCustomUrlQueryValueField: function getCampaignRunIdCustomUrlQueryValueField(req) {
    const fieldName = config.customUrl.queryValue.fields.campaignRunId;
    if (req.campaign && req.campaign.currentCampaignRun) {
      const campaignRunId = req.campaign.currentCampaignRun.id;
      return module.exports.formatCustomUrlQueryValueField(fieldName, campaignRunId);
    }
    return '';
  },
  joinCustomUrlQueryValueFields: function joinCustomUrlQueryValueFields(array) {
    const separator = config.customUrl.queryValue.separator;
    return array.join(separator);
  },
};
