'use strict';

const Promise = require('bluebird');
const linkify = require('linkify-it')({
  fuzzyLink: false,
  fuzzyEmail: false,
});
const restClient = require('./rest-client');

function textHasLinks(text) {
  return linkify.test(text);
}

function findAllLinks(text) {
  return linkify.match(text);
}

async function getRedirectForUrl(url) {
  const response = { url };
  return restClient.createRedirect(url)
    .then((redirect) => {
      response.redirect = redirect;
      return response;
    });
}

async function parseLinksInTextIntoRedirects(text) {
  const links = module.exports.findAllLinks(text);

  if (!links) {
    return text;
  }

  let parsedMessage = text;

  try {
    const redirects = await Promise.map(links, link => module.exports.getRedirectForUrl(link.url));

    redirects.forEach((redirect) => {
      parsedMessage = parsedMessage.replace(redirect.url, redirect.redirect.url);
    });

    return parsedMessage;
  } catch (error) {
    // TODO: Handle and properly log error
    console.log('Bertly error :(');
    console.log(error.message, error.status);
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
