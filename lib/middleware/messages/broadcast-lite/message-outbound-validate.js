'use strict';

const helpers = require('../../../helpers');

module.exports = function validateOutbound() {
  return (req, res, next) => {
    // TODO: Validate sms_status fetched from Fastly
    try {
      /**
       * Verify that the mobileNumber ia valid to send a SMS.
       */
      const mobileNumber = helpers.util.formatMobileNumber(req.mobileNumber);
      helpers.request.setPlatformUserId(req, mobileNumber);
    } catch (err) {
      return helpers.sendErrorResponseWithSuppressHeaders(res, err);
    }

    return next();
  };
};
