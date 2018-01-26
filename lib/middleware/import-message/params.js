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
    logger.debug('POST /import-message', {}, req);

    req.broadcastId = req.query.broadcastId;
    if (!req.broadcastId) {
      const error = new UnprocessibleEntityError('broadcastId is a required query param.');
      return helpers.sendErrorResponse(res, error);
    }

    // parse twilio properties
    helpers.twilio.parseBody(req);

    return next();
  };
};
