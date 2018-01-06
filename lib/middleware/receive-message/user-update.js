'use strict';

const underscore = require('underscore');
const logger = require('../../logger');
const helpers = require('../../helpers');
const northstar = require('../../northstar');

const statuses = helpers.subscription.statuses;

module.exports = function updateNorthstarUser() {
  return (req, res, next) => {
    // Initialize update data.
    req.userUpdateData = helpers.user.getDefaultUpdatePayloadFromReq(req);

    /**
     * Check if User subscription status has changed.
     */
    const replyText = req.rivescriptReplyText;
    const statusUpdate = helpers.user.getSubscriptionStatusUpdate(req.user, replyText);
    if (statusUpdate) {
      req.userUpdateData.sms_status = statusUpdate;
    }

    /**
     * Check if we need to update User address.
     */
    if (req.platformUserAddress && !helpers.user.hasAddress(req.user)) {
      underscore.extend(req.userUpdateData, req.platformUserAddress);
      logger.debug('update address', { data: req.userUpdateData });
    }

    return northstar.updateUser(req.userId, req.userUpdateData)
      .then(() => {
        logger.debug('northstar.updateUser success', { userId: req.userId }, req);

        if (statusUpdate === statuses.less()) {
          return helpers.replies.subscriptionStatusLess(req, res);
        } else if (statusUpdate === statuses.stop()) {
          return helpers.replies.subscriptionStatusStop(req, res);
        }

        return next();
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
