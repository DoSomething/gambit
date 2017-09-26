'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /import-message', { body: req.body });

    // Customer.io's webhook import
    if (helpers.request.isCustomerIo(req)) {
      helpers.customerIo.parseBody(req);

    // Twilio's statusCallback import
    } else if (helpers.request.isStatusCallback(req)) {
      logger.debug('Importing \'Delivered\' Twilio message');
      helpers.twilio.parseBody(req);
    } else {
      const error = new UnprocessibleEntityError('Not a valid import request.');
      return helpers.sendErrorResponse(res, error);
    }

    // get broadcastId property
    helpers.broadcast.parseBody(req);

    return next();
  };
};
