'use strict';

const logger = require('heroku-logger');

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
        try {
          /**
           * Phone number in Northstar profile is not guaranteed to be returned in E.164 format?
           * Mobile returned from a Northstar-thor user was not E.164 compliant
           */
          req.platformUserId = helpers.formatMobileNumber(user.mobile);
        } catch (error) {
          helpers.addBlinkSuppressHeaders(res);
          logger.error('getNorthstarUser: Fatal error formatting Northstar user\'s mobile.');
          return helpers.sendErrorResponse(res, error);
        }
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
