'use strict';

const auth = require('basic-auth');
const logger = require('heroku-logger');

const helpers = require('../helpers');

// TODO move to config file
function validateAuth(user) {
  return (user.name === process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_NAME &&
    user.pass === process.env.DS_GAMBIT_CONVERSATIONS_API_BASIC_AUTH_PASS);
}

function sendUnauthorizedResponse(req, res) {
  logger.error('Unauthorized request headers', req.headers);
  logger.error('Unauthorized request body', req.body);
  res.setHeader('WWW-Authenticate', 'Basic');
  return helpers.sendResponseWithStatusCode(res, 401, 'Unauthorized');
}

module.exports = function authenticate() {
  return (req, res, next) => {
    const user = auth(req) || {};

    if (! validateAuth(user)) {
      return sendUnauthorizedResponse(req, res);
    }

    return next();
  };
};
