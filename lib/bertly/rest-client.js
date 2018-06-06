'use strict';

const request = require('superagent');
const Promise = require('bluebird');

const config = require('../../config/lib/bertly');

/**
 * executePost - sends the POST request to the Bertly service
 *
 * @param  {Object} data
 * @return {Promise}
 */
async function executePost(data) {
  return request
    .post(config.baseUri)
    .type('form')
    .set(config.apiKeyHeader, config.apiKey)
    .send(data)
    .then(res => res.body);
}

/**
 * createRedirect
 *
 * @see https://github.com/DoSomething/bertly#create-redirect
 * @param  {String} url
 * @return {Promise}
 */
async function createRedirect(url) {
  if (!url) {
    return Promise.reject(new TypeError('url is undefined'));
  }
  return executePost({ url });
}

module.exports = {
  createRedirect,
};
