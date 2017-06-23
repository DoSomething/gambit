'use strict';

const logger = require('heroku-logger');
const Users = require('../../app/models/User');
const helpers = require('../helpers');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('chatbot request.params', req.body);

    return next();
  };
};
