'use strict';

const auth = require('basic-auth');
const logger = require('heroku-logger');

const helpers = require('../helpers');
const config = require('../../config/lib/middleware/authenticate');

function validateBasicAuth(user) {
  return (user.name === config.auth.name &&
    user.pass === config.auth.pass);
}

function sendUnauthorizedResponse(req, res) {
  logger.debug('Unauthorized request headers', req.headers);
  logger.debug('Unauthorized request query', req.query);
  logger.debug('Unauthorized request body', req.body);
  res.setHeader('WWW-Authenticate', 'Basic');
  // TODO: Should use helpers.sendErrorResponse for consistency
  return helpers.sendResponseWithStatusCode(res,
    config.unauthorizedErrorCode,
    config.unauthorizedErrorMessage);
}

module.exports = function authenticate() {
  return (req, res, next) => {
    const user = auth(req) || {};

    if (!validateBasicAuth(user)) {
      logger.error(config.unauthorizedErrorMessage);
      return sendUnauthorizedResponse(req, res);
    }

    return next();
  };
};
