'use strict';

const helpers = require('../../helpers');
const NotFoundError = require('../../../app/exceptions/NotFoundError');

/**
 * fetchUser
 *
 * @param {Object} config
 * @param {Boolean} config.shouldSendErrorIfNotFound  Returns a 404 when true if the user
 *                                                    is not found
 * @param {Boolean} config.shouldFetchUnauthenticated     Requests user's public properties only
 */
module.exports = function fetchUser(config) {
  return async (req, res, next) => {
    try {
      let user;
      /**
       * WARNING: Only public properties are returned. Make sure to double check
       * that we are not relaying on some private property down the road in the route when passing
       * shouldFetchUnauthenticated.
       * @see https://github.com/DoSomething/northstar/blob/master/app/Http/Transformers/UserTransformer.php
       */
      if (config.shouldFetchUnauthenticated) {
        /**
         * We can only query based on userId when requesting data anonymously,
         * email and mobile are private!
         */
        user = await helpers.user.unauthenticatedFetchById(req.userId);
      } else {
        user = await helpers.user.fetchFromReq(req);
      }
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
