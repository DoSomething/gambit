'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');

module.exports = function getNorthstarUser() {
  return (req, res, next) => {
    if (req.platform !== 'sms') {
      return next();
    }

    return req.conversation.getNorthstarUser()
      .then((user) => {
        req.user = user;
        req.userId = user.id;
        logger.debug('getNorthstarUser', { userId: req.userId });

        return next();
      })
      .catch((err) => {
        if (err && err.status === 404) {
          logger.debug('getNorthstarUser not found');
          return next();
        }

        return helpers.sendErrorResponse(res, err);
      });
  };
};
