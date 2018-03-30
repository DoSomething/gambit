'use strict';

const logger = require('../../../logger');
const helpers = require('../../../helpers');
const northstar = require('../../../northstar');

module.exports = function updateUndeliverableUser() {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    // Initialize update data.
    req.userUpdateData = helpers.user.getUndeliverableStatusUpdatePayload();

    return northstar.updateUser(req.userId, req.userUpdateData)
      .then(() => {
        logger.debug('northstar.updateUser success', {
          userId: req.userId,
          userUpdateData: req.userUpdateData,
        }, req);
        return helpers.sendResponseWithStatusCode(res, 204);
      })
      .catch((err) => {
        let error = err;
        // TODO: Move parsing this error into our Northstar JS library for all requests.
        if (err.response && err.response.body) {
          error = err.response.body.error;
        }
        return helpers.sendErrorResponse(res, error);
      });
  };
};
