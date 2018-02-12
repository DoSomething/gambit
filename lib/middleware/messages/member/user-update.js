'use strict';

const underscore = require('underscore');
const logger = require('../../../logger');
const helpers = require('../../../helpers');
const northstar = require('../../../northstar');

module.exports = function updateNorthstarUser() {
  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    let statusUpdate = null;
    // Initialize update data.
    try {
      req.userUpdateData = helpers.user.getDefaultUpdatePayloadFromReq(req);
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }

    // Check if User subscription status has changed.
    try {
      const replyText = req.rivescriptReplyText;
      statusUpdate = helpers.user.getSubscriptionStatusUpdate(req.user, replyText);
      if (statusUpdate) {
        req.userUpdateData.sms_status = statusUpdate;
      }
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }

    try {
      // Check if we need to update User address.
      if (req.platformUserAddress && !helpers.user.hasAddress(req.user)) {
        underscore.extend(req.userUpdateData, req.platformUserAddress);
        logger.debug('update address', { data: req.userUpdateData });
      }
    } catch (error) {
      return helpers.sendErrorResponse(res, error);
    }

    return northstar.updateUser(req.userId, req.userUpdateData)
      .then(() => {
        logger.debug('northstar.updateUser success', { userId: req.userId }, req);
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
