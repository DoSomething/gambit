'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const northstar = require('../../../northstar');

module.exports = function createNorthstarUserIfNotFound() {
  return (req, res, next) => {
    if (req.user) {
      return next();
    }
    // SMS is the only platform where we'd potentially be creating a new user if not found.
    if (!helpers.request.isTwilio(req)) {
      return next();
    }

    try {
      req.userCreateData = helpers.user.getDefaultCreatePayloadFromReq(req);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }

    return northstar.createUser(req.userCreateData)
      .then((user) => {
        logger.debug('createUser', { userId: req.userId }, req);
        helpers.request.setUser(req, user);

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
