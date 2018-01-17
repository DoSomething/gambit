'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /messages', {}, req);
    const mobileNumber = req.body.mobile;
    if (!mobileNumber) {
      const error = new UnprocessibleEntityError('Missing required mobile.');
      return helpers.sendErrorResponse(res, error);
    }

    req.platform = 'sms';
    req.platformUserId = mobileNumber;
    // get broadcast properties
    helpers.broadcast.parseBody(req);

    return next();
  };
};
