'use strict';

const helpers = require('../../helpers');
const NotFoundError = require('../../../app/exceptions/NotFoundError');

/**
 * fetchUser
 *
 * @param {Object} config
 * @param {Boolean} config.shouldSendErrorIfNotFound  Returns a 404 when true if the user
 *                                                    is not found
 */
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
        // Expose error metadata in NewRelic
        return helpers.errorNoticeable.sendErrorResponseWithNoRetry(res, userNotFoundError);
      }

      return helpers.sendErrorResponse(res, error);
    }
  };
};
