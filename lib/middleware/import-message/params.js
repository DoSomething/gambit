'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    if (!helpers.request.isTwilioStatusCallback(req)) {
      const error = new UnprocessibleEntityError('Not a valid import request.');
      return helpers.sendErrorResponse(res, error);
    }
    logger.debug('Importing Twilio message', {}, req);
    // parse twilio properties
    helpers.twilio.parseBody(req);
    // get broadcast properties
    helpers.broadcast.parseBody(req);

    return next();
  };
};
