'use strict';

const helpers = require('../../helpers');
const UnprocessibleEntityError = require('../../../app/exceptions/UnprocessibleEntityError');

module.exports = function validateUser() {
  return (req, res, next) => {
    // This check is here because Front messages get routed through here.
    // TODO: Remove this check once Send Message is split into v2 Front + Campaign Signup messages.
    // It's safe to leave for Broadcast messages, because we have already checked for northstarId
    // in our middleware/messages/broadcast/params.
    if (!req.user) {
      return next();
    }

    if (!helpers.user.isSubscriber(req.user)) {
      const error = new UnprocessibleEntityError('Northstar User is unsubscribed.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    if (helpers.user.isPaused(req.user)) {
      const error = new UnprocessibleEntityError('Northstar User conversation is paused.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    try {
      /**
       * Sanity check E.164 format.
       */
      req.platformUserId = helpers.formatMobileNumber(req.user.mobile);
    } catch (err) {
      const error = new UnprocessibleEntityError('Cannot format Northstar User mobile.');
      return helpers.sendErrorResponseWithSuppressHeaders(res, error);
    }

    return next();
  };
};
