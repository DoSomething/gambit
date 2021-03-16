'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function params() {
  return (req, res, next) => {
    const { body } = req;

    logger.debug('origin=broadcastLite', { params: body }, req);

    const requiredFields = [
      'broadcastId',
      'mobile',
      'smsStatus',
      'userId',
    ];
    const missingFields = [];

    requiredFields.forEach((fieldName) => {
      if (!body[fieldName]) {
        missingFields.push(fieldName);
      }
    });

    if (missingFields.length) {
      const errorMessage = `Missing required fields: ${missingFields.join(', ')}`;

      return helpers.sendErrorResponse(res, new UnprocessableEntityError(errorMessage));
    }

    const {
      addrState,
      broadcastId,
      mobile,
      platform,
      smsStatus,
      userId,
    } = body;

    helpers.request.setBroadcastId(req, broadcastId);
    helpers.request.setPlatform(req, platform);
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

    return next();
  };
};
