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
    vars[config.tags.user] = req.user || {};
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
    const data = [];
    const userIdField = module.exports.getUserIdCustomUrlQueryValueField(req);
    if (userIdField) {
      data.push(userIdField);
    }
    const campaignField = module.exports.getCampaignCustomUrlQueryValueField(req);
    if (campaignField) {
      data.push(campaignField);
    }

    const platformField = module.exports.getPlatformCustomUrlQueryValueField(req);
    data.push(platformField);

    return module.exports.joinCustomUrlQueryValueFields(data);
  },
  formatCustomUrlQueryValueField: function getCustomUrlQueryValueField(fieldName, value) {
    const suffix = config.customUrl.queryValue.fieldSuffix;
    return `${fieldName}${suffix}${value}`;
  },
  getUserIdCustomUrlQueryValueField: function getUserIdCustomUrlQueryValueField(req) {
    const fieldName = config.customUrl.queryValue.fields.userId;
    if (req.user && req.user.id) {
      return module.exports.formatCustomUrlQueryValueField(fieldName, req.user.id);
    }
    return '';
  },
  getCampaignCustomUrlQueryValueField: function getCampaignCustomUrlQueryValueField(req) {
    const fields = config.customUrl.queryValue.fields;
    const campaign = req.campaign;
    if (!campaign) {
      return '';
    }
    const data = [];
    data.push(module.exports.formatCustomUrlQueryValueField(fields.campaignId, campaign.id));
    if (campaign.currentCampaignRun) {
      const runId = campaign.currentCampaignRun.id;
      data.push(module.exports.formatCustomUrlQueryValueField(fields.campaignRunId, runId));
    }
    return module.exports.joinCustomUrlQueryValueFields(data);
  },
  getPlatformCustomUrlQueryValueField: function getPlatformCustomUrlQueryValueField(req) {
    const fieldName = config.customUrl.queryValue.fields.platform;
    return module.exports.formatCustomUrlQueryValueField(fieldName, req.platform);
  },
  joinCustomUrlQueryValueFields: function joinCustomUrlQueryValueFields(array) {
    const separator = config.customUrl.queryValue.separator;
    return array.join(separator);
  },
};
