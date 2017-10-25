'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');
const Cacheman = require('cacheman');
const logger = require('heroku-logger');
const underscore = require('underscore');
const config = require('../config/lib/gambit-campaigns');

const cache = new Cacheman('campaigns', { ttl: config.cacheTtl });
const activeCampaignsCacheKey = config.activeCampaignsCacheKey;
const uri = config.clientOptions.baseUri;
const apiKey = config.clientOptions.apiKey;

/**
 * Executes a GET request to given Gambit Campaigns endpoint.
 * @param {string} endpoint
 * @return {Promise}
 */
function executeGet(endpoint) {
  const url = `${uri}/${endpoint}`;
  logger.trace('gambitCampaigns.get', { url });

  return superagent.get(url)
    .then(res => res.body.data)
    .catch(err => err);
}

/**
 * Executes a POST request to given Gambit Campaigns endpoint with given data.
 * @param {string} endpoint
 * @param {object} data
 * @return {Promise}
 */
function executePost(endpoint, data) {
  return superagent
    .post(`${uri}/${endpoint}`)
    .set('x-gambit-api-key', apiKey)
    .send(data)
    .then(res => res.body)
    .catch(err => Promise.reject(err));
}

/**
 * @param {object} campaign
 * @return {boolean}
 */
module.exports.isActiveCampaign = function (campaign) {
  return campaign.status !== config.closedStatusValue;
};

/**
 * @param {array} campaigns
 * @return {object}
 */
function parseCampaignsIndexResponse(campaigns) {
  const campaignIds = [];
  const keywords = {};

  campaigns.forEach((campaign) => {
    const campaignId = campaign.id;
    campaign.keywords.forEach((keyword) => {
      const lowercaseKeyword = keyword.toLowerCase();
      keywords[lowercaseKeyword] = campaignId;
    });
    if (exports.isActiveCampaign(campaign)) {
      campaignIds.push(campaignId);
    }
  });

  const result = {
    campaignIds,
    keywords,
  };
  logger.trace('parseCampaignsIndexResponse', result);

  return result;
}

/**
 * @return {Promise}
 */
function fetchActiveCampaigns() {
  logger.debug('fetchActiveCampaigns');

  return new Promise((resolve, reject) => {
    executeGet('campaigns')
      .then(res => cache.set(activeCampaignsCacheKey, parseCampaignsIndexResponse(res)))
      .then(activeCampaigns => resolve(activeCampaigns))
      .catch(error => reject(error));
  });
}

/**
 * @return {Promise}
 */
function getActiveCampaigns() {
  return cache.get(activeCampaignsCacheKey)
    .then((activeCampaigns) => {
      if (activeCampaigns) {
        logger.debug('activeCampaigns cache hit');
        return Promise.resolve(activeCampaigns);
      }
      logger.debug('activeCampaigns cache miss');
      return fetchActiveCampaigns();
    })
    .catch(err => err);
}

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
    executePost('receive-message', data)
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
    executeGet(endpoint)
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

  return getActiveCampaigns()
    .then((activeCampaigns) => {
      const campaignId = activeCampaigns.keywords[keyword];
      if (!campaignId) {
        return Promise.resolve(false);
      }

      return exports.getCampaignById(campaignId);
    });
};

/**
 * @param {array}
 * @param {number} target
 * @return {object}
 */
function getRandomElementNotEqualTo(array, target) {
  let randomElement = underscore.sample(array);
  // Sanity check:
  if (array.length === 1) {
    return randomElement;
  }
  // TODO: Super sanity check to make sure our array contains an element different than target to
  // avoid infinite looping.
  while (randomElement === target) {
    randomElement = underscore.sample(array);
  }
  return randomElement;
}

/**
 * @param {number} campaignId
 * @return {Promise}
 */
module.exports.getRandomActiveCampaignNotEqualTo = function (campaignId) {
  logger.debug('getRandomActiveCampaignNotEqualTo', { campaignId });

  return getActiveCampaigns()
    .then((activeCampaigns) => {
      const randomCampaignId = getRandomElementNotEqualTo(activeCampaigns.campaignIds, campaignId);

      return exports.getCampaignById(randomCampaignId);
    });
};
