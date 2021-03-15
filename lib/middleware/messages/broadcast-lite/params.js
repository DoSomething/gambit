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
  return helpers.sendErrorResponse(res, new UnprocessableEntityError(`Missing required ${field}`));
}

module.exports = function params() {
  return (req, res, next) => {
    logger.debug('origin=broadcastLite', { params: req.body }, req);

    const {
      addrState,
      broadcastId,
      mobile,
      platform,
      smsStatus,
      userId,
    } = req.body;

    if (!broadcastId) {
      return sendMissingFieldError(res, 'broadcastId');
    }

    if (!mobile) {
      return sendMissingFieldError(res, 'mobile');
    }

    if (!userId) {
      return sendMissingFieldError(res, 'userId');
    }

    helpers.request.setBroadcastId(req, broadcastId);

    /**
     * Construct a Northstar user based on our request parameters.
     * TODO: Add voting plan fields.
     */
    helpers.request.setUser(req, {
      addr_state: addrState,
      id: userId,
      mobile,
      sms_status: smsStatus,
    });

    helpers.request.setPlatform(req, platform);

    return next();
  };
};
