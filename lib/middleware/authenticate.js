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

    if (!validateBasicAuth(user)) {
      logger.error(unauthorizedErrorMessage);
      return sendUnauthorizedResponse(req, res);
    }

    return next();
  };
};
