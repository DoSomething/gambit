'use strict';

const Mustache = require('mustache');
const qs = require('qs');
const logger = require('../logger');

function customUrl(req) {
  const params = {
    user: req.userId,
  };
  if (req.campaign) {
    params.campaign = req.campaign.currentCampaignRun.id;
  }
  const result = `http://www.puppetsloth.com?${qs.stringify(params)}`;
  logger.debug('customUrl', { result });

  return result;
}

function getVars(req) {
  return {
    custom_url: customUrl(req),
  };
}

module.exports = {
  render: function render(string, req) {
    return Mustache.render(string, getVars(req));
  },
};
