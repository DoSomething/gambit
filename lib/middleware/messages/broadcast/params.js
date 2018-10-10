'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

/**
 * sendMissingFieldError
 *
 * @param {Response} res
 * @param {String} field
 */
function sendMissingFieldError(res, field) {
  const error = new UnprocessableEntityError(`Missing required ${field}`);
  return helpers.sendErrorResponse(res, error);
}

module.exports = function params() {
  return (req, res, next) => {
    const body = req.body;
    const userId = helpers.request.getUserIdParamFromReq(req);
    logger.debug('origin=broadcast', { params: body }, req);

    // BroadcastId is required
    helpers.request.setBroadcastId(req, body.broadcastId);
    if (!req.broadcastId) {
      return sendMissingFieldError(res, 'broadcastId');
    }
    // UserId is required
    helpers.request.setUserId(req, userId);
    if (!req.userId) {
      return sendMissingFieldError(res, 'userId');
    }
    helpers.request.setPlatform(req, body.platform);
    return next();
  };
};
