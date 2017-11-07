'use strict';

// const logger = require('heroku-logger');
const helpers = require('../../helpers');

module.exports = function params() {
  return (req, res, next) => {
    req.useTwilioTestCredentials = req.query.useTwilioTestCredentials === 'true';
    try {
      // get broadcast properties
      helpers.broadcast.parseBody(req);
    } catch (error) {
      helpers.sendErrorResponse(req, res, error);
    }
    return next();
  };
};
