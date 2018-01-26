'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('POST /messages', { params: req.body }, req);
    req.userId = req.body.northstarId;
    if (!req.userId) {
      const error = new UnprocessibleEntityError('Missing required northstarId.');
      return helpers.sendErrorResponse(res, error);
    }

    req.broadcastId = req.body.broadcastId;
    if (!req.broadcastId) {
      const error = new UnprocessibleEntityError('Missing required broadcastId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.analytics.addParameters({
      broadcastId: req.broadcastId,
      userId: req.userId,
    });

    return next();
  };
};
