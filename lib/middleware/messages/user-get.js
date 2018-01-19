'use strict';

const helpers = require('../../helpers');
const NotFoundError = require('../../../app/exceptions/NotFoundError');

module.exports = function getNorthstarUser() {
  return (req, res, next) => {
    // This check is here because Front messages get routed through here.
    // TODO: Remove this check once Send Message is split into v2 Front + Campaign Signup messages.
    // It's safe to leave for Broadcast messages, because we have already checked for northstarId
    // in our middleware/messages/broadcast/params.
    if (!req.userId) {
      return next();
    }

    return helpers.user.fetchById(req.userId)
      .then((user) => {
        req.user = user;

        return next();
      })
      .catch((err) => {
        if (err && err.status === 404) {
          helpers.addBlinkSuppressHeaders(res);
          const error = new NotFoundError('Northstar user not found.');
          return helpers.sendErrorResponse(res, error);
        }

        return helpers.sendErrorResponse(res, err);
      });
  };
};
