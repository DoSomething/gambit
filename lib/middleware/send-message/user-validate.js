'use strict';

const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function validateUser() {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    if (req.user.sms_status === helpers.subscriptionStatusStopValue()) {
      const error = new UnprocessibleEntityError('Northstar User is unsubscribed.');
      return helpers.sendErrorResponse(res, error);
    }

    if (req.user.sms_paused) {
      const error = new UnprocessibleEntityError('Northstar User conversation is paused.');
      return helpers.sendErrorResponse(res, error);
    }

    try {
      /**
       * Sanity check E.164 format.
       */
      req.platformUserId = helpers.formatMobileNumber(req.user.mobile);
    } catch (err) {
      const error = new UnprocessibleEntityError('Cannot format Northstar User mobile.');
      return helpers.sendErrorResponse(res, error);
    }

    return next();
  };
};
