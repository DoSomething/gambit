'use strict';

const { GatewayClient } = require('@dosomething/gateway/server');

const utilsHelper = require('./helpers/util');

let gatewayClient;

function getClient() {
  if (!gatewayClient) {
    gatewayClient = GatewayClient.getNewInstance();
  }
  return gatewayClient;
}

function getConfig() {
  return getClient().config;
}

/**
 * createPost
 *
 * @param {object} data
 * @return {Promise}
 */
function createPost(data) {
  return module.exports.getClient().Rogue.Posts
    .create(Object.assign(data, { text: utilsHelper.truncateText(data.text) }));
}

/**
 * createSignup
 *
 * @param {object} data
 * @return {Promise}
 */
function createSignup(data) {
  return module.exports.getClient().Rogue.Signups.create(data);
}

/**
 * fetchSignups
 *
 * @param {Object} query
 * @return {Promise}
 */
function fetchSignups(query) {
  return module.exports.getClient().Rogue.Signups.index(query);
}

/**
 * getPosts
 *
 * @param {object} query
 * @return {Promise}
 */
function fetchPosts(query) {
  return module.exports.getClient().Rogue.Posts.index(query);
}

module.exports = {
  getClient,
  getConfig,
  createPost,
  createSignup,
  fetchPosts,
  fetchSignups,
};
