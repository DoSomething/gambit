'use strict';

const logger = require('../../logger');
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
          logger.debug('createNorthstarUser', { userId: req.userId }, req);
        }

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
