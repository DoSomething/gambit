'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const gateway = require('../../../gateway');

module.exports = function createNorthstarUserIfNotFound() {
  return (req, res, next) => {
    if (req.user) {
      return next();
    }

    // SMS is the only platform where we'd potentially be creating a new user if not found.
    // TODO: Move this check into user-get. If SMS, Ok for 404 because we create new User. If not,
    // throw error, because we're expecting to have been passed a userId parameter.
    if (!helpers.request.isTwilio(req)) {
      return next();
    }

    try {
      req.userCreateData = helpers.user.getCreatePayloadFromReq(req);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }

    return gateway.createUser(req.userCreateData)
      .then((user) => {
        logger.debug('createUser', { userId: req.userId }, req);
        helpers.request.setUser(req, user);

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
