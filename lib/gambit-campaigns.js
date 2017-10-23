'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');
const Cacheman = require('cacheman');
const logger = require('heroku-logger');
const config = require('../config/lib/gambit-campaigns');

const cache = new Cacheman('campaigns', { ttl: config.cacheTtl });
const activeCampaignsCacheKey = 'active';
const uri = config.clientOptions.baseUri;
const apiKey = config.clientOptions.apiKey;

/**
 * Executes a GET request to given Gambit Campaigns endpoint.
 * @param {string} endpoint
 * @return {Promise}
 */
module.exports.get = function (endpoint) {
  const url = `${uri}/${endpoint}`;
  logger.trace('gambitCampaigns.get', { url });

  return superagent.get(url)
    .then(res => res.body.data)
    .catch(err => err);
};

/**
 * Executes a POST request to given Gambit Campaigns endpoint with given data.
 * @param {string} endpoint
 * @param {object} data
 * @return {Promise}
 */
module.exports.post = function (endpoint, data) {
  return superagent
    .post(`${uri}/${endpoint}`)
    .set('x-gambit-api-key', apiKey)
    .send(data)
    .then(res => res.body)
    .catch(err => Promise.reject(err));
};

/**
 * @param {object} campaigns
 * @return {object}
 */
function getKeywordMap(campaigns) {
  const keywords = {};
  campaigns.forEach((campaign) => {
    campaign.keywords.forEach((keywordObject) => {
      const keyword = keywordObject.keyword.toLowerCase();
      keywords[keyword] = Number(campaign.id);
    });
  });

  return keywords;
}

/**
 * @param {object} campaign
 * @return {boolean}
 */
module.exports.isActiveCampaign = function (campaign) {
  return campaign.status !== 'closed';
};

/**
 * @param {object} campaigns
 * @return {object}
 */
function parseCampaignsIndexResponse(campaigns) {
  const activeCampaigns = campaigns.filter(campaign => exports.isActiveCampaign(campaign));
  const keywords = getKeywordMap(activeCampaigns);
  const result = {
    campaigns: activeCampaigns,
    keywords,
  };

  return result;
}

/**
 * @return {Promise}
 */
function fetchActiveCampaigns() {
  logger.debug('fetchActiveCampaigns');

  return new Promise((resolve, reject) => {
    exports.get('campaigns')
      .then(res => cache.set(activeCampaignsCacheKey, parseCampaignsIndexResponse(res)))
      .then(activeCampaigns => resolve(activeCampaigns))
      .catch(error => reject(error));
  });
}

/**
 * @return {Promise}
 */
module.exports.getActiveCampaigns = function () {
  return cache.get(activeCampaignsCacheKey)
    .then((activeContent) => {
      if (activeContent) {
        logger.debug('activeCampaigns cache hit');
        return Promise.resolve(activeContent);
      }
      logger.debug('activeCampaigns cache miss');
      return fetchActiveCampaigns();
    })
    .catch(err => err);
};

/**
 * Parse our incoming Express request for expected Gambit Campaigns format.
 * @param {object} req
 * @return {object}
 */
function parseReceiveMessageRequest(req) {
  const data = {
    userId: req.userId,
    campaignId: req.campaign.id,
    text: req.inboundMessageText,
    mediaUrl: req.mediaUrl,
    broadcastId: req.broadcastId,
  };
  if (req.keyword) {
    data.keyword = req.keyword.toLowerCase();
  }

  return data;
}

/**
 * Posts data to the /receive-message endpoint.
 */
module.exports.postReceiveMessage = function (req) {
  const data = parseReceiveMessageRequest(req);
  const loggerMessage = 'gambitCampaigns.postReceiveMessage';
  logger.debug(loggerMessage, data);

  return new Promise((resolve, reject) => {
    this.post('receive-message', data)
      .then((res) => {
        logger.trace(`${loggerMessage} res.data`, res.data);
        return resolve(res.data);
      })
      .catch(err => reject(err));
  });
};

/**
 * @param {number} campaignId
 * @return {Promise}
 */
function fetchCampaignById(campaignId) {
  const endpoint = `campaigns/${campaignId}`;

  return new Promise((resolve, reject) => {
    exports.get(endpoint)
      .then(res => cache.set(`${campaignId}`, res))
      .then(campaign => resolve(campaign))
      .catch(error => reject(error));
  });
}

/**
 * @param {number} campaignId
 * @return {Promise}
 */
module.exports.getCampaignById = function (campaignId) {
  logger.debug('getCampaignById', { campaignId });

  return cache.get(`${campaignId}`)
    .then((campaign) => {
      if (campaign) {
        logger.debug('Campaigns cache hit', { campaignId });
        return Promise.resolve(campaign);
      }
      logger.debug('Campaigns cache miss', { campaignId });
      return fetchCampaignById(campaignId);
    })
    .catch(err => err);
};

/**
 * @param {string} keyword
 * @return {Promise}
 */
module.exports.getCampaignByKeyword = function (keyword) {
  logger.debug('getCampaignByKeyword', { keyword });

  return exports.getActiveCampaigns()
    .then((activeCampaigns) => {
      const campaignId = activeCampaigns.keywords[keyword];
      if (!campaignId) {
        return Promise.resolve(false);
      }

      return exports.getCampaignById(campaignId);
    });
};
