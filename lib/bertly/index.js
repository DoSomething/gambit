'use strict';

const Promise = require('bluebird');
const linkify = require('linkify-it')({
  fuzzyLink: false,
  fuzzyEmail: false,
});

const analyticsHelper = require('../helpers/analytics');
const logger = require('../logger');
const restClient = require('./rest-client');
const config = require('../../config/lib/bertly');

/**
 * isEnabled - Checks if feature is enabled in this environment
 *
 * @return {Boolean}
 */
function isEnabled() {
  return config.enabled;
}

/**
 * textHasLinks
 *
 * @see http://markdown-it.github.io/linkify-it/doc/#LinkifyIt.prototype.test
 * @param  {String} text description
 * @return {Boolean}
 */
function textHasLinks(text) {
  return linkify.test(text);
}

/**
 * findAllLinks
 *
 * @see http://markdown-it.github.io/linkify-it/doc/#LinkifyIt.prototype.match
 * @param  {String} text
 * @return {Array|Null}
 */
function findAllLinks(text) {
  return linkify.match(text);
}

/**
 * getRedirectForUrl - Creates a redirect in the Bertly service. It returns the created redirect
 *                     as well the original link value.
 *
 * @async
 * @see {@link https://github.com/DoSomething/bertly/blob/master/documentation/README.md#create-link|Response}
 * @param  {String} url
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
 * parseLinksIntoRedirects - searches the text for links. It creates redirects for each link
 *                                 in the Bertly service. Replaces the instances of the original
 *                                 links with the corresponding shortened redirect. If the service
 *                                 is not available, it cleanly returns the original text.
 *
 * @async
 * @param  {String} text = ''
 * @return {Promise<String>} The parsed text
 */
async function parseLinksIntoRedirects(text = '') {
  const links = module.exports.findAllLinks(text);

  if (!links) {
    return text;
  }

  let parsedMessage = text;

  try {
    /**
     * TODO: Research using the JS Set type here so that we can store unique found Links.
     * This way we can prevent sending one request per found Link, even when all found Links are the
     * same URL.
     */
    const redirects = await Promise.map(links, link => module.exports.getRedirectForUrl(link.url));

    redirects.forEach((redirect) => {
      parsedMessage = parsedMessage.replace(redirect.originalUrl, redirect.redirect.url_short);
    });

    return parsedMessage;
  } catch (error) {
    // Expose error metadata in NewRelic
    analyticsHelper.addHandledError(error);
    logger.error('parseLinksIntoRedirects() Error creating redirects.', {
      error: error.message,
      status: error.status,
    });
  }
  return parsedMessage;
}

module.exports = {
  isEnabled,
  restClient,
  textHasLinks,
  findAllLinks,
  getRedirectForUrl,
  parseLinksIntoRedirects,
};
