'use strict';

const { RogueClient } = require('@dosomething/gateway/server');

let rogueClient;

function getClient() {
  if (!rogueClient) {
    rogueClient = RogueClient.getNewInstance();
  }
  return rogueClient;
}

function getQueryByUserIdAndCampaignId(userId, campaignId) {
  const query = {};
  query['filter[northstar_id]'] = userId;
  query['filter[campaign_id]'] = campaignId;
  return query;
}

/**
 * createPost
 *
 * @param {object} data
 * @return {Promise}
 */
function createPost(data) {
  return module.exports.getClient().Posts.create(data);
}

/**
 * createSignup
 *
 * @param {object} data
 * @return {Promise}
 */
function createSignup(data) {
  return module.exports.getClient().Signups.create(data);
}

/**
 * fetchSignups
 *
 * @param {String} userId
 * @param {Number} campaignId
 * @return {Promise}
 */
function fetchSignups(userId, campaignId) {
  const query = getQueryByUserIdAndCampaignId(userId, campaignId);
  return module.exports.getClient().Signups.index(query);
}

/**
 * getPosts
 *
 * @param {object} query
 * @return {Promise}
 */
function getPosts(query) {
  return module.exports.getClient().Posts.index(query);
}

module.exports = {
  getClient,
  createPost,
  createSignup,
  fetchSignups,
  getPosts,
};
