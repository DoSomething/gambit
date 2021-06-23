'use strict';

const logger = require('heroku-logger');

const gateway = require('./gateway');

function getUsersEndpoint() {
  return gateway.getClient().Northstar.Users;
}

/**
 * @param {string} data
 * @return {Promise}
 */
module.exports.createUser = async (data) => {
  logger.debug('createUser', data);

  const json = await getUsersEndpoint().create(data);

  return json.data;
};

/**
 * @param {string} id The Northstar id for this user
 * @return {Promise}
 */
module.exports.fetchUserById = async (id) => {
  logger.debug('fetchUserById', { id });

  const json = await getUsersEndpoint().get(id);

  return json.data;
};

/**
 * @param {string} mobile
 * @return {Promise}
 */
module.exports.fetchUserByMobile = async (mobile) => {
  logger.debug('fetchUserByMobile', { mobile });

  const json = await getUsersEndpoint().getByMobile(mobile);

  return json.data;
};

/**
 * @param {string} userId
 * @param {object} data
 * @return {Promise}
 */
module.exports.updateUser = async (userId, data) => {
  logger.debug('northstar.updateUser', { userId, data });

  const json = await getUsersEndpoint().update(userId, data);

  return json.data;
};
