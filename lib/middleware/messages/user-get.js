'use strict';

const helpers = require('../../helpers');
const NotFoundError = require('../../../app/exceptions/NotFoundError');

module.exports = function getNorthstarUser() {
  return (req, res, next) => {
    let promise;
    if (req.userId) {
      promise = helpers.user.fetchById(req.userId);
    } else {
      promise = req.conversation.getNorthstarUser();
    }

    return promise
      .then((user) => {
        req.user = user;

        return next();
      })
      .catch((err) => {
        if (err && err.status === 404) {
          const error = new NotFoundError('Northstar user not found.');
          return helpers.sendErrorResponseWithSuppressHeaders(res, error);
        }

        return helpers.sendErrorResponse(res, err);
      });
  };
};
