'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    logger.debug('POST /import-message', { body });

    if (!helpers.request.isCustomerIO(req)) {
      const error = new UnprocessibleEntityError('Invalid platform.');
      return helpers.sendErrorResponse(res, error);
    }

    req.platform = 'sms';
    req.platformUserId = body.phone;
    req.broadcastId = body.broadcastId;
    req.messageFields = body.fields;

    return next();
  };
};
