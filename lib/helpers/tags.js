'use strict';

const Mustache = require('mustache');
const logger = require('../logger');

const config = require('../../config/lib/helpers/tags');

module.exports = {
  getCustomUrl: function getCustomUrl(req) {
    const params = module.exports.getCustomUrlQueryParams(req);
    const result = `${config.customUrl}?${config.customUrlQueryParam}=${params}`;
    logger.debug('customUrl', { result });

    return result;
  },
  getCustomUrlQueryParams: function getCustomUrlQueryParams(req) {
    const result = [`user:${req.userId}`];
    if (req.campaign && req.campaign.currentCampaignRun) {
      result.push(`campaign:${req.campaign.currentCampaignRun.id}`);
    }
    return result.join(',');
  },
  getVars: function getVars(req) {
    return {
      custom_url: module.exports.getCustomUrl(req),
    };
  },
  render: function render(string, req) {
    return Mustache.render(string, module.exports.getVars(req));
  },
};
