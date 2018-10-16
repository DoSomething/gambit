'use strict';

const { RogueClient } = require('@dosomething/gateway/server');

let rogueClient;

function getClient() {
  if (!rogueClient) {
    rogueClient = RogueClient.getNewInstance();
  }
  return rogueClient;
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
  getPosts,
};