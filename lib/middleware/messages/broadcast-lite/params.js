'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
// TODO: Change file name
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessibleEntityError');

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
    logger.debug('origin=broadcastLite', { params: body }, req);

    // BroadcastId is required
    helpers.request.setBroadcastId(req, body.broadcastId);
    /**
     * FIXME: if we use property setting helpers, we should also
     * abstract checking if they are valid, otherwise we are leaking
     * implementation details here that will not change once we update
     * the property setting helpers.
     */
    if (!req.broadcastId) {
      return sendMissingFieldError(res, 'broadcastId');
    }
    // UserId is required
    helpers.request.setUserId(req, userId);
    // FIXME: See above
    if (!req.userId) {
      return sendMissingFieldError(res, 'userId');
    }
    // mobileNumber is required
    helpers.request.setMobileNumber(req, body.mobile);
    // FIXME: See above
    if (!req.mobileNumber) {
      return sendMissingFieldError(res, 'mobile');
    }
    helpers.request.setPlatform(req, body.platform);
    return next();
  };
};
