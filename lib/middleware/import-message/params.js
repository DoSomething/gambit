'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    if (!helpers.request.isTwilioStatusCallback(req)) {
      const error = new UnprocessibleEntityError('Not a valid import request.');
      return helpers.sendErrorResponse(req, res, error);
    }
    logger.debug('Importing \'Delivered\' Twilio message');
    // parse twilio properties
    helpers.twilio.parseBody(req);
    // get broadcast properties
    helpers.broadcast.parseBody(req);

    return next();
  };
};
