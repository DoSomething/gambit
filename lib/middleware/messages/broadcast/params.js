'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /messages', { params: req.body }, req);
    const userId = req.body.northstarId;
    if (!userId) {
      const error = new UnprocessibleEntityError('Missing required northstarId.');
      return helpers.sendErrorResponse(res, error);
    }

    req.userId = userId;
    // get broadcast properties
    helpers.broadcast.parseBody(req);

    return next();
  };
};
