'use strict';

const underscore = require('underscore');
const logger = require('../../logger');
const helpers = require('../../helpers');
const northstar = require('../../northstar');

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
    // Note: We're setting SMS status for Slack users. If we ever integrate with another platform,
    // we'll want to store separate platform subscription values on a Northstar User.
    const currentStatus = req.user.sms_status;
    const lessValue = helpers.subscription.statuses.less();
    const stopValue = helpers.subscription.statuses.stop();
    const undeliverableValue = helpers.subscription.statuses.undeliverable();
    let statusUpdate = null;

    if (helpers.macro.isSubscriptionStatusStop(replyText)) {
      statusUpdate = stopValue;
    } else if (helpers.macro.isSubscriptionStatusLess(replyText)) {
      statusUpdate = lessValue;
    // If User is set to undeliverable but we've now received a message from them OR we don't
    // have a status set at all:
    } else if (currentStatus === stopValue ||
      currentStatus === undeliverableValue || !currentStatus) {
      // TODO: There's an edge case here, if a User sends STOP while they're paused.
      // We'll want to update the Conversation.paused to true by default if we're bringing someone
      // back to life.
      statusUpdate = helpers.subscription.statuses.active();
    }
    if (statusUpdate) {
      data.sms_status = statusUpdate;
    }

    /**
     * Check for User location.
     */
    if (req.platformUserLocation && !helpers.user.hasLocation(req.user)) {
      underscore.extend(data, req.platformUserLocation);
      logger.debug('update userLocation', { data });
    }

    return northstar.updateUser(req.userId, data)
      .then(() => {
        logger.debug('northstar.updateUser success', { userId: req.userId, data }, req);

        if (statusUpdate === lessValue) {
          return helpers.replies.subscriptionStatusLess(req, res);
        } else if (statusUpdate === stopValue) {
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
