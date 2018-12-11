'use strict';

const { GatewayClient } = require('@dosomething/gateway/server');

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
 * @param {Object} query
 * @return {Promise}
 */
function fetchSignups(query) {
  return module.exports.getClient().Signups.index(query);
}

/**
 * getPosts
 *
 * @param {object} query
 * @return {Promise}
 */
function fetchPosts(query) {
  return module.exports.getClient().Posts.index(query);
}

module.exports = {
  getClient,
  getConfig,
  createPost,
  createSignup,
  fetchPosts,
  fetchSignups,
};
