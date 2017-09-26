'use strict';

const auth = require('basic-auth');
const logger = require('heroku-logger');

const helpers = require('../helpers');

const unauthorizedErrorMessage = 'Invalid or missing auth parameters. Unauthorized.';

// TODO move to config file
function validateBasicAuth(user) {
  return (user.name === process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_NAME &&
    user.pass === process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_PASS);
}

// TODO: We don't need this when Blink becomes the proxy between Twilio statuCallbacks and
// Conversations. For now it's here for testing purposes, as the Twilio Messaging API doesn't
// support setting Basic Auth in the statusCallback query param when POSTing a new message.
function validateAPIKey(apiKey) {
  return (apiKey === process.env.DS_GAMBIT_CONVERSATIONS_API_KEY);
}

function getAPIKey(req) {
  return req.query.apiKey || req.body.apiKey;
}

function sendUnauthorizedResponse(req, res) {
  logger.debug('Unauthorized request headers', req.headers);
  logger.debug('Unauthorized request query', req.query);
  logger.debug('Unauthorized request body', req.body);
  res.setHeader('WWW-Authenticate', 'Basic');
  return helpers.sendResponseWithStatusCode(res, 401, unauthorizedErrorMessage);
}

module.exports = function authenticate() {
  return (req, res, next) => {
    const user = auth(req) || {};
    const apiKey = getAPIKey(req);

    if (!validateBasicAuth(user) && !validateAPIKey(apiKey)) {
      logger.error(unauthorizedErrorMessage);
      return sendUnauthorizedResponse(req, res);
    }

    return next();
  };
};
