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
  return getClient().Posts.create(data);
}

function getConfig() {
  return getClient().config;
}

module.exports = {
  getConfig,
  getClient,
  createPost,
};
