'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');

module.exports = function createNorthstarUserIfNotFound() {
  return (req, res, next) => {
    if (req.user) {
      return next();
    }

    return req.conversation.createNorthstarUser()
      .then((user) => {
        req.user = user;
        if (user.id) {
          req.userId = user.id;
          logger.debug('createNorthstarUser', { userId: req.userId });
        }

        return next();
      })
      .catch(err => helpers.sendErrorResponse(req, res, err));
  };
};
