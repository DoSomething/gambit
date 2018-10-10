'use strict';

const helpers = require('../../helpers');
const UnprocessableEntityError = require('../../../app/exceptions/UnprocessableEntityError');

module.exports = function validateOutbound(config) {
  return (req, res, next) => {
    if (!helpers.user.isSubscriber(req.user)) {
      const error = new UnprocessableEntityError('Northstar User is unsubscribed.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    if (config.shouldSendWhenPaused === false && helpers.user.isPaused(req.user)) {
      const error = new UnprocessableEntityError('Northstar User conversation is paused.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    if (req.platform !== 'sms') {
      return next();
    }

    try {
      /**
       * Verify that User has valid mobile number to send a SMS.
       */
      const mobileNumber = helpers.util.formatMobileNumber(req.user.mobile);
      helpers.request.setPlatformUserId(req, mobileNumber);
    } catch (err) {
      return helpers.sendErrorResponseWithSuppressHeaders(res, err);
    }

    return next();
  };
};
