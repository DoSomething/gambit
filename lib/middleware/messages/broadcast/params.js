'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const UnprocessibleEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    const userId = helpers.request.getUserIdParamFromReq(req);
    logger.debug('origin=broadcast', { params: body }, req);

    helpers.request.setUserId(req, userId);
    if (!req.userId) {
      const error = new UnprocessibleEntityError('Missing required userId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setBroadcastId(req, body.broadcastId);
    if (!req.broadcastId) {
      const error = new UnprocessibleEntityError('Missing required broadcastId.');
      return helpers.sendErrorResponse(res, error);
    }

    helpers.request.setPlatform(req, body.platform);

    return next();
  };
};
