'use strict';

// const logger = require('heroku-logger');
const helpers = require('../../helpers');

module.exports = function params() {
  return (req, res, next) => {
    try {
      // get broadcast properties
      helpers.broadcast.parseBody(req);
    } catch (error) {
      helpers.sendErrorResponse(res, error);
    }
    return next();
  };
};
