'use strict';

const helpers = require('../../../helpers');
const UnprocessableEntityError = require('../../../../app/exceptions/UnprocessableEntityError');

module.exports = function validateOutbound() {
  return (req, res, next) => {
    if (!helpers.user.isSubscriber(req.user)) {
      const error = new UnprocessableEntityError('Northstar User is unsubscribed.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }
    try {
      /**
       * Verify that the mobileNumber is valid to send a SMS.
       */
      const mobileNumber = helpers.util.formatMobileNumber(req.mobileNumber);
      helpers.request.setPlatformUserId(req, mobileNumber);
    } catch (err) {
      return helpers.sendErrorResponseWithSuppressHeaders(res, err);
    }

    return next();
  };
};
