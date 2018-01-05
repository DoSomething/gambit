'use strict';

const underscore = require('underscore');
const logger = require('../../logger');
const helpers = require('../../helpers');
const northstar = require('../../northstar');

const statuses = helpers.subscription.statuses;

module.exports = function updateNorthstarUser() {
  return (req, res, next) => {
    // Initialize update data.
    const data = {
      last_messaged_at: req.inboundMessage.createdAt.toISOString(),
      sms_paused: req.conversation.paused,
    };

    /**
     * Check if User subscription status has changed.
     */
    const replyText = req.rivescriptReplyText;
    const statusUpdate = helpers.user.getSubscriptionStatusUpdate(req.user, replyText);
    if (statusUpdate) {
      data.sms_status = statusUpdate;
    }

    /**
     * Check if we need to update User address.
     */
    if (req.platformUserAddress && !helpers.user.hasAddress(req.user)) {
      underscore.extend(data, req.platformUserAddress);
      logger.debug('update userLocation', { data });
    }

    return northstar.updateUser(req.userId, data)
      .then(() => {
        logger.debug('northstar.updateUser success', { userId: req.userId, data }, req);

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
