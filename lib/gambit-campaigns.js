'use strict';

const superagent = require('superagent');
const Promise = require('bluebird');
const underscore = require('underscore');

const helpers = require('./helpers');
const logger = require('./logger');
const config = require('../config/lib/gambit-campaigns');

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
    .catch(err => Promise.reject(err));
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
 * @return {Promise}
 */
module.exports.fetchDefaultTopicTriggers = function () {
  return executeGet('defaultTopicTriggers');
};

/**
 * @param {object} campaign
 * @return {boolean}
 */
module.exports.hasKeywords = function (campaign) {
  return campaign.keywords && campaign.keywords.length > 0;
};

/**
 * @param {object} campaign
 * @return {boolean}
 */
module.exports.isClosedCampaign = function (campaign) {
  return campaign.status === config.closedStatusValue;
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

    // If this campaign isnt closed, add it to list of availble Campaigns for Campaign select.
    if (!exports.isClosedCampaign(campaign)) {
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
    executeGet('campaigns?exclude=true')
      .then((res) => {
        const data = parseCampaignsIndexResponse(res);
        return helpers.cache.campaigns.set(activeCampaignsCacheKey, data);
      })
      .then(activeCampaigns => resolve(activeCampaigns))
      .catch(error => reject(error));
  });
}

/**
 * @return {Promise}
 */
function getActiveCampaigns() {
  return helpers.cache.campaigns.get(activeCampaignsCacheKey)
    .then((activeCampaigns) => {
      if (activeCampaigns) {
        logger.debug('activeCampaigns cache hit');
        return Promise.resolve(activeCampaigns);
      }
      logger.debug('activeCampaigns cache miss');
      return fetchActiveCampaigns();
    })
    .catch(err => Promise.reject(err));
}

/**
 * Parse our incoming Express request for expected Gambit Campaigns format.
 * @param {object} req
 * @return {object}
 */
function getCampaignActivityPayloadFromReq(req) {
  const data = {
    userId: req.userId,
    campaignId: req.campaign.id,
    campaignRunId: req.campaign.currentCampaignRun.id,
    postType: req.topic.postType,
    text: req.inboundMessageText,
    mediaUrl: req.mediaUrl,
    broadcastId: req.broadcastId,
    platform: req.platform,
  };
  if (req.keyword) {
    data.keyword = req.keyword.toLowerCase();
  }

  return data;
}

/**
 * Posts campaign activity to Gambit Campaigns.
 */
module.exports.postCampaignActivity = function (req) {
  const data = getCampaignActivityPayloadFromReq(req);
  const loggerMessage = 'gambitCampaigns.postCampaignActivity';
  logger.debug(loggerMessage, data, req);

  return new Promise((resolve, reject) => {
    executePost('campaignActivity', data)
      .then((res) => {
        logger.debug(`${loggerMessage} response`, res.data, req);
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
      .then(res => helpers.cache.campaigns.set(`${campaignId}`, res))
      .then(campaign => resolve(campaign))
      .catch(error => reject(error));
  });
}

/**
 * @param {number} campaignId
 * @return {Promise}
 */
module.exports.fetchTopicById = function fetchTopicById(topicId) {
  const endpoint = `topics/${topicId}`;
  return executeGet(endpoint);
};

/**
 * @param {number} campaignId
 * @return {Promise}
 */
module.exports.getCampaignById = function (campaignId) {
  logger.debug('getCampaignById', { campaignId });

  return helpers.cache.campaigns.get(`${campaignId}`)
    .then((campaign) => {
      if (campaign) {
        logger.debug('Campaigns cache hit', { campaignId });
        return Promise.resolve(campaign);
      }
      logger.debug('Campaigns cache miss', { campaignId });
      return fetchCampaignById(campaignId);
    })
    .catch(err => Promise.reject(err));
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

/**
 * @param {Object} campaign
 * @param {String} templateName
 * @return {String}
 */
module.exports.getMessageTextFromMessageTemplate = function (campaign, templateName) {
  const result = campaign.botConfig.templates[templateName].rendered;
  if (!result) {
    throw new Error(`Template ${templateName} undefined for campaignId ${campaign.id}`);
  }
  return result;
};
