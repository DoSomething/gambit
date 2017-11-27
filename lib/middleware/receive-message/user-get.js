'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');

module.exports = function getNorthstarUser() {
  return (req, res, next) => req.conversation.getNorthstarUser()
    .then((user) => {
      req.user = user;
      req.userId = user.id;
      logger.debug('getNorthstarUser', { userId: req.userId }, req);
      helpers.analytics.addParameters({
        userId: req.userId,
      });

      return next();
    })
    .catch((err) => {
      if (err && err.status === 404) {
        logger.debug('getNorthstarUser not found', {}, req);
        return next();
      }

      return helpers.sendErrorResponse(res, err);
    });
};
