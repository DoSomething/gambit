'use strict';

const logger = require('heroku-logger');
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
 * @param {string} data
 * @return {Promise}
 */
const createUser = async (data) => {
  logger.debug('createUser', data);

  const json = await module.exports.getClient().Northstar.Users
    .create(data);

  return json.data;
};

/**
 * @param {string} id The Northstar id for this user
 * @return {Promise}
 */
const fetchUserById = async (id) => {
  logger.debug('fetchUserById', { id });

  const json = await module.exports.getClient().Northstar.Users
    .get(id);

  return json.data;
};

/**
 * @param {string} mobile
 * @return {Promise}
 */
const fetchUserByMobile = async (mobile) => {
  logger.debug('fetchUserByMobile', { mobile });

  const json = await module.exports.getClient().Northstar.Users
    .getByMobile(mobile);

  return json.data;
};

/**
 * @param {string} userId
 * @param {object} data
 * @return {Promise}
 */
const updateUser = async (userId, data) => {
  logger.debug('updateUser', { userId, data });

  const json = await module.exports.getClient().Northstar.Users
    .update(userId, data);

  return json.data;
};

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
  createUser,
  fetchPosts,
  fetchSignups,
  fetchUserById,
  fetchUserByMobile,
  updateUser,
};
