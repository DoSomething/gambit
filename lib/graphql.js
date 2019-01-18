'use strict';

const graphql = require('graphql-request');

const config = require('../config/lib/graphql');

/**
 * Executes a GraphQL query.
 *
 * @param {String} query
 * @param {Object} variables
 * @return {Promise}
 */
function request(query, variables) {
  return graphql.request(`${config.url}/graphql`, query, variables);
}

/**
  * Fetches a topic from GraphQL.
  *
  * @param {String} id
  * @return {Promise}
  */
async function fetchTopicById(id) {
  const res = await module.exports.request(config.queries.fetchTopicById, { id });
  return res.topic;
}

module.exports = {
  fetchTopicById,
  request,
};
