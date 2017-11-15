'use strict';

const logger = require('heroku-logger');
const helpers = require('../../helpers');

module.exports = function getNorthstarUser() {
  return (req, res, next) => {
    req.conversation.getNorthstarUser()
      .then((user) => {
        req.user = user;
        req.userId = user.id;
        logger.debug('getNorthstarUser',
          helpers.request.injectRequestId({ userId: req.userId }, req));

        return next();
      })
      .catch((err) => {
        if (err && err.status === 404) {
          logger.debug('getNorthstarUser not found', helpers.request.injectRequestId(req));
          return next();
        }

        return helpers.sendErrorResponse(res, err);
      });
  };
};
