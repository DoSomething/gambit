'use strict';

const logger = require('heroku-logger');
const { GatewayClient } = require('../../../gateway-js/server');

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
 * @param {Object} data
 * @return {Promise}
 */
const createUser = async (data) => {
  logger.debug('createUser', data);

  const json = await module.exports.getClient().Northstar.Users.create(data);

  return json.data;
};

/**
 * @param {String} id
 * @return {Promise}
 */
const fetchUserById = async (id) => {
  logger.debug('fetchUserById', { id });

  const json = await module.exports.getClient().Northstar.Users.get(id);

  return json.data;
};

/**
 * @param {String} mobile
 * @return {Promise}
 */
const fetchUserByMobile = async (mobile) => {
  logger.debug('fetchUserByMobile', { mobile });

  const json = await module.exports.getClient().Northstar.Users.getByMobile(mobile);

  return json.data;
};

/**
 * @param {String} id
 * @param {Object} data
 * @return {Promise}
 */
const updateUser = async (id, data) => {
  logger.debug('updateUser', { id, data });

  const json = await module.exports.getClient().Northstar.Users
    .update(id, data);

 return json.data;
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
  createUser,
  fetchPosts,
  fetchSignups,
  fetchUserById,
  fetchUserByMobile,
  updateUser,
};
