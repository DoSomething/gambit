'use strict';

const logger = require('../../logger');
const helpers = require('../../helpers');
const northstar = require('../../northstar');

module.exports = function createNorthstarUserIfNotFound() {
  return (req, res, next) => {
    if (req.user) {
      return next();
    }
    // Gambit Slack is only used internally by DS Staff.
    // We currently don't have a need to create a User for their DS email - it should already exist.
    if (helpers.request.isSlack(req)) {
      return next();
    }

    try {
      req.userCreateData = helpers.user.getDefaultCreatePayloadFromReq(req);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }

    return northstar.createUser(req.userCreateData)
      .then((user) => {
        req.user = user;
        req.userId = user.id;
        logger.debug('createNorthstarUser', { userId: req.userId }, req);
        helpers.analytics.addParameters({
          userId: req.userId,
        });

        return next();
      })
      .catch(err => helpers.sendErrorResponse(res, err));
  };
};
