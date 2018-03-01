'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');

module.exports = function getNorthstarUser() {
  return (req, res, next) => helpers.user.fetchFromReq(req)
    .then((user) => {
      helpers.request.setUser(req, user);

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
