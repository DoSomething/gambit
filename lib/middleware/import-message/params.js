'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /import-message', { body: req.body });

    if (!helpers.request.isCustomerIo(req)) {
      const error = new UnprocessibleEntityError('Invalid platform.');
      return helpers.sendErrorResponse(res, error);
    }
    helpers.customerIo.parseBody(req);

    return next();
  };
};
