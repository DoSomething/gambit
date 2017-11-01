'use strict';

const helpers = require('../../helpers');
const northstar = require('../../northstar');
const NotFoundError = require('../../../app/exceptions/NotFoundError');

module.exports = function getNorthstarUser() {
  return (req, res, next) => {
    if (!req.userId) {
      return next();
    }

    return northstar.fetchUserById(req.userId)
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
