'use strict';

const mustache = require('mustache');
const logger = require('../logger');

const config = require('../../config/lib/helpers/tags');

module.exports = {
  getCustomUrl: function getCustomUrl(req) {
    const value = module.exports.getCustomUrlQueryValue(req);
    const url = `${config.customUrl}?${config.customUrlQueryParam}=${value}`;
    logger.debug('customUrl', { url });

    return url;
  },
  getCustomUrlQueryValue: function getCustomUrlQueryValue(req) {
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
