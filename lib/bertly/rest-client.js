'use strict';

const request = require('superagent');
const querystring = require('querystring');

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
 * createRedirect - Receives an URL. It is URI encoded and sent
 *              as the value of the url= property to Bertly.
 *
 * @see https://github.com/DoSomething/bertly#create-redirect
 * @param  {string} url
 * @return {Promise}
 */
async function createRedirect(url) {
  const encodedUrl = querystring.escape(url);
  return executePost({ url: encodedUrl });
}

module.exports = {
  createRedirect,
};
