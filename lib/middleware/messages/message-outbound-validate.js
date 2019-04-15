'use strict';

const helpers = require('../../helpers');
const UnprocessableEntityError = require('../../../app/exceptions/UnprocessableEntityError');

module.exports = function validateOutbound(config) {
  return (req, res, next) => {
    // TODO: Check against local cache (or unsubscribed blacklist)
    // once we move to Northstar-less broadcasts
    if (!helpers.user.isSubscriber(req.user)) {
      const error = new UnprocessableEntityError('Northstar User is unsubscribed.');
      // Expose error metadata in NewRelic
      return helpers.errorNoticeable.sendErrorResponseWithNoRetry(res, error);
    }
    // TODO: Check against local cache (or unsubscribed blacklist)
    // once we move to Northstar-less broadcasts
    if (config.shouldSendWhenPaused === false && helpers.user.isPaused(req.user)) {
      const error = new UnprocessableEntityError('Northstar User conversation is paused.');
      // Expose error metadata in NewRelic
      return helpers.errorNoticeable.sendErrorResponseWithNoRetry(res, error);
    }

    if (req.platform !== 'sms') {
      return next();
    }

    try {
      /**
       * Verify that User has valid mobile number to send a SMS.
       * TODO: Use the conversation's platformUserId instead of the user.mobile once we move to
       * Northstar-less broadcasts
       */
      const mobileNumber = helpers.util.formatMobileNumber(req.user.mobile);
      helpers.request.setPlatformUserId(req, mobileNumber);
    } catch (err) {
      return helpers.sendErrorResponseWithNoRetry(res, err);
    }

    return next();
  };
};
