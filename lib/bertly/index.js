'use strict';

const Promise = require('bluebird');
const linkify = require('linkify-it')({
  fuzzyLink: false,
  fuzzyEmail: false,
});

const logger = require('../logger');
const restClient = require('./rest-client');

/**
 * textHasLinks
 *
 * @see http://markdown-it.github.io/linkify-it/doc/#LinkifyIt.prototype.test
 * @param  {string} text description
 * @return {boolean}
 */
function textHasLinks(text) {
  return linkify.test(text);
}

/**
 * findAllLinks
 *
 * @see http://markdown-it.github.io/linkify-it/doc/#LinkifyIt.prototype.match
 * @param  {string} text
 * @return {Array|null}
 */
function findAllLinks(text) {
  return linkify.match(text);
}

/**
 * getRedirectForUrl - Creates a redirect in the Bertly service. It returns the created redirect
 *                     as well the original link value.
 *
 * @async
 * @see {@link https://github.com/DoSomething/bertly#create-redirect|Response}
 * @param  {string} url
 * @return {Promise<Object>}
 */
async function getRedirectForUrl(url) {
  const response = { originalUrl: url };
  return restClient.createRedirect(url)
    .then((redirect) => {
      response.redirect = redirect;
      return response;
    });
}

/**
 * parseLinksInTextIntoRedirects - searches the text for links. It creates redirects for each link
 *                                 in the Bertly service. Replaces the instances of the original
 *                                 links with the corresponding shortened redirect. If the service
 *                                 is not available, it cleanly returns the original text.
 *
 * @async
 * @param  {string} text = ''
 * @return {Promise<string>} The parsed text
 */
async function parseLinksInTextIntoRedirects(text = '') {
  const links = module.exports.findAllLinks(text);

  if (!links) {
    return text;
  }

  let parsedMessage = text;

  try {
    // We need all redirects before replacing them
    const redirects = await Promise.map(links, link => module.exports.getRedirectForUrl(link.url));

    redirects.forEach((redirect) => {
      parsedMessage = parsedMessage.replace(redirect.originalUrl, redirect.redirect.url);
    });

    return parsedMessage;
  } catch (error) {
    logger.error('parseLinksInTextIntoRedirects() Error creating redirects.', {
      error: error.message,
      status: error.status,
    });
  }
  return parsedMessage;
}

module.exports = {
  textHasLinks,
  restClient,
  findAllLinks,
  getRedirectForUrl,
  parseLinksInTextIntoRedirects,
};
