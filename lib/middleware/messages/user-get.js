'use strict';

const helpers = require('../../helpers');
const NotFoundError = require('../../../app/exceptions/NotFoundError');

module.exports = function fetchUser(config) {
  return async (req, res, next) => {
    try {
      const user = await helpers.user.fetchFromReq(req);
      helpers.request.setUser(req, user);
      return next();
    } catch (error) {
      if (error && error.status === 404) {
        if (!config.shouldSendErrorIfNotFound) {
          return next();
        }
        const userNotFoundError = new NotFoundError('Northstar user not found.');
        return helpers.sendErrorResponseWithSuppressHeaders(res, userNotFoundError);
      }

      return helpers.sendErrorResponse(res, error);
    }
  };
};
