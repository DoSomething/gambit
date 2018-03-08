'use strict';

const helpers = require('../../helpers');
const NotFoundError = require('../../../app/exceptions/NotFoundError');

module.exports = function fetchUser(config) {
  return (req, res, next) => helpers.user.fetchFromReq(req)
    .then((user) => {
      helpers.request.setUser(req, user);

      return next();
    })
    .catch((err) => {
      if (err && err.status === 404) {
        if (!config.shouldSendErrorIfNotFound) {
          return next();
        }
        const error = new NotFoundError('Northstar user not found.');
        return helpers.sendErrorResponseWithSuppressHeaders(res, error);
      }

      return helpers.sendErrorResponse(res, err);
    });
};
